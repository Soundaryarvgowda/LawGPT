import os
import shutil
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from bson import ObjectId

from database import get_db
from models import UserCreate, UserResponse, Token, ChatQuery, ChatResponse, SummarizeRequest
from auth import get_current_user
from rag import ingest_pdfs, query_rag, summarize_document

app = FastAPI(title="LawGPT API")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://law-gpt-rouge.vercel.app",
        "https://law-gpt-git-samrud141-samruds-projects.vercel.app",
        "https://law-cj4gtgemt-samruds-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user.get("_id")),
        "name": current_user.get("name", ""),
        "email": current_user.get("email", ""),
        "image": current_user.get("image")
    }

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    os.makedirs("data/pdfs", exist_ok=True)
    file_path = f"data/pdfs/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    ingest_pdfs()
    
    return {"message": f"Successfully uploaded and ingested {file.filename}"}

@app.post("/query", response_model=ChatResponse)
async def query_legal_assistant(chat_query: ChatQuery, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    result = query_rag(chat_query.query)
    
    # Save to chat history
    chat_entry = {
        "user_id": str(current_user["_id"]),
        "query": chat_query.query,
        "response": result["response"],
        "created_at": datetime.utcnow().isoformat()
    }
    await db.chat_history.insert_one(chat_entry)
    
    return result

@app.get("/history")
async def get_history(current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    cursor = db.chat_history.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    history = await cursor.to_list(length=100)
    
    for h in history:
        h["_id"] = str(h["_id"])
        
    return history

@app.post("/summarize")
async def summarize(request: SummarizeRequest, current_user: dict = Depends(get_current_user)):
    summary = summarize_document(request.document_id)
    return {"summary": summary}

@app.get("/health")
async def health_check(db = Depends(get_db)):
    try:
        # A simple ping command to test the connection to MongoDB
        await db.command("ping")
        return {"status": "success", "message": "Successfully connected to MongoDB Atlas!"}
    except Exception as e:
        return {"status": "error", "message": f"MongoDB connection failed: {str(e)}"}

@app.get("/")
def read_root():
    return {"message": "Welcome to LawGPT API"}
