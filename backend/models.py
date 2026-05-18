from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    image: Optional[str] = None

class UserInDB(UserResponse):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatQuery(BaseModel):
    query: str

class ChatResponse(BaseModel):
    response: str
    sources: Optional[List[dict]] = []

class SummarizeRequest(BaseModel):
    document_id: str
