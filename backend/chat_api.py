from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv
import requests
import time
import os

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client
client = genai.Client()

# Subject-specific system prompts (from AITA_Model.py)
SYSTEM_PROMPTS = {
    "generic": """You are a friendly, helpful academic tutor.
        Show students step-by-step how to approach homework questions, but never give them the final answer.
        If the student asks a conceptual question, explain the concept in a way that is easy for a student 
        to understand, and give examples to illustrate the concept in action. Always prioritize learning 
        over straight answers. When provided with course materials, cite them in your responses.
        """,
    "math": """You are a friendly, helpful mathematics tutor.
        Show students step-by-step how to approach problems, but never give them the final answer.
        Always prioritize learning over straight answers. When provided with course materials, cite them.
        """,
    "physics": """You are a friendly, helpful physics tutor.
        Show students step-by-step how to approach problems, but never give them the final answer.
        Always prioritize learning over straight answers. If the student asks a conceptual question, explain the concept 
        in a way that is easy for a student to understand, and give examples to illustrate the concept in action.
        When provided with course materials, cite them in your responses.
        """,
    "english": """You are a friendly, helpful English literature/composition tutor.
        Help students with comprehending and discussing literature, learning grammar rules and techniques, and improving their writing
        and communication skills, but never write an essay for them. You are allowed to give comments and feedback about writing they show
        you, and small snippets of revisions (max 1 or 2 sentences), but never write full paragraphs or papers for them. Always prioritize
        learning over final products/deliverables. When provided with course materials, cite them.
        """,
    "computer_science": """You are a friendly, helpful Computer Science/Programming tutor.
        Help students with comprehending coding concepts such as syntax and logic when writing code, as well as building more complex 
        algorithms and data structures. You are allowed to provide them with pseudocode and step-by-step code logic, as well as provide
        tweaks for a single line of code if they are struggling with syntax or it is a very specific issue that needs to be fixed, but 
        never write more than one line of code for them. You are also allowed to debug code for them, but in a constructive way, and again
        try to refrain from rewriting anything more than one line of code. Always prioritize learning, through the student writing all the 
        actual code themselves, over giving them code you generated. When provided with course materials, cite them.
        """
}

# Request model
class ChatRequest(BaseModel):
    question: str
    subject: str = "generic"  # math, physics, english, computer_science, generic
    course_id: str = None  # Optional: for filtering by specific course

# Response model
class ChatResponse(BaseModel):
    answer: str
    sources: list = []

def query_chroma(question: str, n_results: int = 3):
    """
    Query the backend's Chroma database for relevant course materials
    """
    try:
        response = requests.get(
            "http://localhost:8000/api/query-chroma",
            params={"query": question, "n_results": n_results}
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error querying Chroma: {e}")
        return None

def format_context_from_chroma(chroma_results):
    """
    Format Chroma results into context string for Gemini
    """
    if not chroma_results or not chroma_results.get("results"):
        return None, []
    
    context_parts = []
    sources = []
    
    for i, result in enumerate(chroma_results["results"]):
        content = result.get("content", "")
        metadata = result.get("metadata", {})
        
        context_parts.append(f"[Source {i+1}]: {content}")
        
        # Store source info for citations
        sources.append({
            "rank": result.get("rank", i+1),
            "course": metadata.get("course", "Unknown"),
            "chunk_id": metadata.get("chunk_id", "Unknown")
        })
    
    context = "\n\n".join(context_parts)
    return context, sources

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint that combines Chroma retrieval with Gemini generation
    """
    try:
        # Step 1: Query Chroma for relevant course materials
        chroma_results = query_chroma(request.question, n_results=3)
        context, sources = format_context_from_chroma(chroma_results)
        
        # Step 2: Build the prompt with context
        system_prompt = SYSTEM_PROMPTS.get(request.subject.lower(), SYSTEM_PROMPTS["generic"])
        
        if context:
            # Add context to the user's question
            enhanced_question = f"""Here are relevant materials from the course:

{context}

Student question: {request.question}

Please answer the student's question using the course materials provided above. Cite the sources when you use them (e.g., "According to Source 1..."). If the course materials don't contain the answer, you can say so and provide general guidance."""
        else:
            # No context found - answer generally
            enhanced_question = f"""{request.question}

Note: I couldn't find specific course materials related to this question, so I'll provide general guidance."""
        
        # Step 3: Call Gemini with the enhanced prompt
        conversation_history = [
            types.Content(role="user", parts=[types.Part(text=enhanced_question)])
        ]
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=conversation_history,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,
            )
        )
        
        answer = response.text
        
        return ChatResponse(answer=answer, sources=sources)
        
    except Exception as e:
        if "429" in str(e):
            # Rate limit - retry once after 2 seconds
            time.sleep(2)
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again in a moment.")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/")
def root():
    return {"message": "AITA Chat API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)