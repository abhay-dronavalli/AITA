from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import uuid
import PyPDF2
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

# Import our modules
from chroma_setup import init_chroma, create_collection, add_to_chroma
from text_chunker import chunk_text
from database import get_db, User, Course, Enrollment, generate_course_code, init_db
from auth import hash_password, verify_password, create_access_token, get_current_user

# Create FastAPI app
app = FastAPI()

# Add CORS middleware
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

# ============================================
# PYDANTIC MODELS (Request/Response schemas)
# ============================================

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    role: str  # "teacher" or "student"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class JoinCourseRequest(BaseModel):
    course_code: str

# ============================================
# STARTUP EVENT
# ============================================

@app.on_event("startup")
def startup_event():
    init_db()
    print("🚀 Database initialized")

# ============================================
# BASIC ROUTES
# ============================================

@app.get("/")
def index():
    return {"data": {"name": "AITA"}}

@app.get("/about")
def about():
    return {"data": "About page"}

# ============================================
# AUTHENTICATION ROUTES
# ============================================

@app.post("/api/auth/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Create new user account"""
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Validate role
        if request.role not in ["teacher", "student"]:
            raise HTTPException(status_code=400, detail="Role must be 'teacher' or 'student'")
        
        # Validate password length
        if len(request.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        # Create user
        hashed_pwd = hash_password(request.password)
        new_user = User(
            email=request.email,
            password_hash=hashed_pwd,
            role=request.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Create token
        token = create_access_token({"user_id": new_user.id, "role": new_user.role})
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "role": new_user.role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")

@app.post("/api/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"user_id": user.id, "role": user.role})
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }

@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }

# ============================================
# FILE UPLOAD ROUTES (Old endpoints - still work)
# ============================================

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

# ============================================
# CHROMA ROUTES
# ============================================

@app.post("/api/store-in-chroma")
def store_in_chroma(file_id: str, course_name: str = "Untitled Course"):
    """
    Extract PDF text, chunk it, and store in Chroma
    (Old endpoint - still works for testing)
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
        documents = chunks
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

@app.get("/api/query-chroma")
def query_chroma_endpoint(query: str, n_results: int = 3):
    """Query Chroma for relevant course content"""
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

# ============================================
# COURSE ROUTES (New authenticated endpoints)
# ============================================

@app.post("/api/courses")
async def create_course(
    name: str,
    subject: str,
    guardrail_level: str = "moderate",
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new course with uploaded materials"""
    try:
        # Only teachers can create courses
        if current_user.role != "teacher":
            raise HTTPException(status_code=403, detail="Only teachers can create courses")
        
        # Validate subject
        valid_subjects = ["generic", "math", "physics", "english", "computer_science"]
        if subject not in valid_subjects:
            raise HTTPException(status_code=400, detail=f"Subject must be one of: {valid_subjects}")
        
        # Validate PDF
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files allowed")
        
        # Generate unique course code
        course_code = generate_course_code()
        
        # Create course in database
        new_course = Course(
            teacher_id=current_user.id,
            name=name,
            subject=subject,
            guardrail_level=guardrail_level,
            course_code=course_code
        )
        db.add(new_course)
        db.commit()
        db.refresh(new_course)
        
        # Upload and process file
        try:
            # Save file
            file_id = str(uuid.uuid4())
            file_path = UPLOAD_DIR / f"{file_id}.pdf"
            contents = await file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            
            # Extract text and store in Chroma
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
            
            if not text.strip():
                raise Exception("No text found in PDF")
            
            # Chunk the text
            chunks = chunk_text(text, chunk_size=500, overlap=50)
            
            if len(chunks) == 0:
                raise Exception("No chunks created from PDF")
            
            # Store in Chroma with course metadata
            documents = chunks
            ids = [f"course_{new_course.id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [
                {
                    "course_id": str(new_course.id),
                    "course_name": new_course.name,
                    "subject": new_course.subject,
                    "file_id": file_id,
                    "chunk_id": i
                }
                for i in range(len(chunks))
            ]
            
            add_to_chroma(chroma_collection, documents, ids, metadatas)
            
        except Exception as e:
            # If file processing fails, delete the course
            db.delete(new_course)
            db.commit()
            raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")
        
        return {
            "success": True,
            "course": {
                "id": new_course.id,
                "name": new_course.name,
                "subject": new_course.subject,
                "course_code": new_course.course_code,
                "guardrail_level": new_course.guardrail_level
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Course creation failed: {str(e)}")

@app.get("/api/courses")
def get_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all courses for current user"""
    if current_user.role == "teacher":
        # Teachers see their own courses
        courses = db.query(Course).filter(Course.teacher_id == current_user.id).all()
    else:
        # Students see enrolled courses
        enrollments = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()
        courses = [enrollment.course for enrollment in enrollments]
    
    return {
        "courses": [
            {
                "id": course.id,
                "name": course.name,
                "subject": course.subject,
                "course_code": course.course_code if current_user.role == "teacher" else None,
                "guardrail_level": course.guardrail_level
            }
            for course in courses
        ]
    }

@app.get("/api/courses/{course_id}")
def get_course_details(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific course"""
    course = db.query(Course).filter(Course.id == course_id).first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if user has access
    if current_user.role == "teacher" and course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your course")
    
    if current_user.role == "student":
        enrollment = db.query(Enrollment).filter(
            Enrollment.course_id == course_id,
            Enrollment.student_id == current_user.id
        ).first()
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in this course")
    
    # Get enrolled students if teacher
    enrolled_students = []
    if current_user.role == "teacher":
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
        enrolled_students = [
            {
                "id": e.student.id,
                "email": e.student.email,
                "joined_at": e.joined_at.isoformat()
            }
            for e in enrollments
        ]
    
    return {
        "id": course.id,
        "name": course.name,
        "subject": course.subject,
        "course_code": course.course_code if current_user.role == "teacher" else None,
        "guardrail_level": course.guardrail_level,
        "created_at": course.created_at.isoformat(),
        "enrolled_students": enrolled_students if current_user.role == "teacher" else None
    }

@app.post("/api/courses/join")
def join_course(
    request: JoinCourseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Student joins a course via course code"""
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can join courses")
    
    # Find course
    course = db.query(Course).filter(Course.course_code == request.course_code).first()
    if not course:
        raise HTTPException(status_code=404, detail="Invalid course code")
    
    # Check if already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.course_id == course.id,
        Enrollment.student_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    # Create enrollment
    enrollment = Enrollment(course_id=course.id, student_id=current_user.id)
    db.add(enrollment)
    db.commit()
    
    return {
        "success": True,
        "message": "Successfully joined course",
        "course": {
            "id": course.id,
            "name": course.name,
            "subject": course.subject
        }
    }
