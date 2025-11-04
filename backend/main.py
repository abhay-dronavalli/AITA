from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import uuid
import PyPDF2

# Import our new modules
from chroma_setup import init_chroma, create_collection, add_to_chroma
from text_chunker import chunk_text

app = FastAPI()

# Add CORS so frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads folder
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize Chroma (runs once when server starts)
chroma_client = init_chroma()
chroma_collection = create_collection(chroma_client, "course_materials")

# Original routes
@app.get("/")
def index():
    return {"data": {"name": "AITA"}}

@app.get("/about")
def about():
    return {"data": "About page"}

# Week 4: File upload endpoint
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a PDF file"""
    try:
        # Check if it's a PDF
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files allowed")
        
        # Generate unique ID
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}.pdf"
        
        # Save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        return {
            "success": True,
            "file_id": file_id,
            "filename": file.filename,
            "message": "Upload successful"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Week 4: Extract text from PDF
@app.get("/api/extract/{file_id}")
def extract_pdf_text(file_id: str):
    """Extract text from uploaded PDF"""
    file_path = UPLOAD_DIR / f"{file_id}.pdf"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            
            # Extract text from all pages
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            
            return {
                "success": True,
                "file_id": file_id,
                "num_pages": len(pdf_reader.pages),
                "text_length": len(text),
                "preview": text[:500]  # First 500 characters
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Week 4: List uploaded files
@app.get("/api/files")
def list_files():
    """List all uploaded files"""
    files = []
    for file_path in UPLOAD_DIR.iterdir():
        if file_path.is_file():
            files.append({
                "file_id": file_path.stem,  # filename without extension
                "size": file_path.stat().st_size
            })
    return {"files": files, "count": len(files)}

#Store in Chroma endpoint
@app.post("/api/store-in-chroma")
def store_in_chroma(file_id: str, course_name: str = "Untitled Course"):
    """
    Extract PDF text, chunk it, and store in Chroma
    
    Args:
        file_id: ID from /api/upload response
        course_name: Name of the course
    
    Returns:
        Success message with number of chunks stored
    """
    try:
        # Find the uploaded file
        file_path = UPLOAD_DIR / f"{file_id}.pdf"
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Extract text from PDF
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")
        
        # Chunk the text
        chunks = chunk_text(text, chunk_size=500, overlap=50)
        
        if len(chunks) == 0:
            raise HTTPException(status_code=400, detail="No chunks created")
        
        # Prepare for Chroma
        documents = chunks  # Just the text strings
        ids = [f"{file_id}_chunk_{i}" for i in range(len(chunks))]
        metadatas = [
            {
                "file_id": file_id,
                "course": course_name,
                "chunk_id": i
            }
            for i in range(len(chunks))
        ]
        
        # Store in Chroma
        add_to_chroma(chroma_collection, documents, ids, metadatas)
        
        return {
            "success": True,
            "file_id": file_id,
            "course": course_name,
            "num_chunks": len(chunks),
            "message": f"Stored {len(chunks)} chunks in Chroma"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage failed: {str(e)}")

#Query Chroma endpoint
@app.get("/api/query-chroma")
def query_chroma_endpoint(query: str, n_results: int = 3):
    """
    Query Chroma for relevant course content
    
    Args:
        query: Student's question
        n_results: Number of relevant chunks to return
    
    Returns:
        List of relevant text chunks with metadata
    """
    try:
        if not query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Query Chroma
        results = chroma_collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        # Format results
        formatted_results = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                formatted_results.append({
                    "rank": i + 1,
                    "content": doc,
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else None,
                    "distance": results["distances"][0][i] if results["distances"] else None
                })
        
        return {
            "success": True,
            "query": query,
            "num_results": len(formatted_results),
            "results": formatted_results
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

#Chroma Stats endpoint
@app.get("/api/chroma-stats")
def chroma_stats():
    """Check how many chunks are stored in Chroma"""
    try:
        count = chroma_collection.count()
        return {
            "success": True,
            "total_chunks": count,
            "message": f"Database contains {count} chunks"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
