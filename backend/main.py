from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import uuid
import PyPDF2

app = FastAPI()

#Add CORS so frontend can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Create uploads folder
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

#Original routes
@app.get("/")
def index():
    return {"data": {"name": "AITA"}}

@app.get("/about")
def about():
    return {"data": "About page"}

#File upload endpoint
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a PDF file"""
    try:
        #Check if it's a PDF
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files allowed")
        
        #Generate unique ID for the file
        file_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / f"{file_id}.pdf"
        
        #Save the file
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

#Extract text from PDF
@app.get("/api/extract/{file_id}")
def extract_pdf_text(file_id: str):
    """Extract text from uploaded PDF"""
    file_path = UPLOAD_DIR / f"{file_id}.pdf"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            
            #Extract text from all pages
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            
            return {
                "success": True,
                "file_id": file_id,
                "num_pages": len(pdf_reader.pages),
                "text_length": len(text),
                "preview": text[:500]  #First 500 characters
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#List uploaded files
@app.get("/api/files")
def list_files():
    """List all uploaded files"""
    files = []
    for file_path in UPLOAD_DIR.iterdir():
        if file_path.is_file():
            files.append({
                "file_id": file_path.stem,  #filename without extension
                "size": file_path.stat().st_size
            })
    return {"files": files, "count": len(files)}