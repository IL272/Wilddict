from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import uvicorn

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./wilddict.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class WordDB(Base):
    __tablename__ = "words"
    
    id = Column(Integer, primary_key=True, index=True)
    word = Column(String, index=True)
    definition = Column(String)
    example = Column(String)
    language = Column(String)
    source_language = Column(String)
    tags = Column(String)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# Pydantic models
class WordBase(BaseModel):
    word: str
    definition: str
    example: str
    language: str
    source_language: str
    tags: Optional[List[str]] = []

class WordCreate(WordBase):
    pass

class Word(WordBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# FastAPI app
app = FastAPI(
    title="WildDict API",
    description="AI-powered visual dictionary backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes
@app.get("/")
async def root():
    return {
        "message": "WildDict API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/words", response_model=List[Word])
async def get_words(
    skip: int = 0,
    limit: int = 100,
    language: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all words with optional filtering"""
    query = db.query(WordDB)
    
    if language:
        query = query.filter(WordDB.language == language)
    
    words = query.offset(skip).limit(limit).all()
    
    # Convert tags from string to list
    result = []
    for word in words:
        word_dict = {
            "id": word.id,
            "word": word.word,
            "definition": word.definition,
            "example": word.example,
            "language": word.language,
            "source_language": word.source_language,
            "tags": word.tags.split(",") if word.tags else [],
            "created_at": word.created_at
        }
        result.append(Word(**word_dict))
    
    return result

@app.get("/api/words/{word_id}", response_model=Word)
async def get_word(word_id: int, db: Session = Depends(get_db)):
    """Get a specific word by ID"""
    word = db.query(WordDB).filter(WordDB.id == word_id).first()
    
    if not word:
        raise HTTPException(status_code=404, detail="Word not found")
    
    word_dict = {
        "id": word.id,
        "word": word.word,
        "definition": word.definition,
        "example": word.example,
        "language": word.language,
        "source_language": word.source_language,
        "tags": word.tags.split(",") if word.tags else [],
        "created_at": word.created_at
    }
    
    return Word(**word_dict)

@app.post("/api/words", response_model=Word)
async def create_word(word: WordCreate, db: Session = Depends(get_db)):
    """Create a new word"""
    db_word = WordDB(
        word=word.word,
        definition=word.definition,
        example=word.example,
        language=word.language,
        source_language=word.source_language,
        tags=",".join(word.tags) if word.tags else ""
    )
    
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    
    word_dict = {
        "id": db_word.id,
        "word": db_word.word,
        "definition": db_word.definition,
        "example": db_word.example,
        "language": db_word.language,
        "source_language": db_word.source_language,
        "tags": db_word.tags.split(",") if db_word.tags else [],
        "created_at": db_word.created_at
    }
    
    return Word(**word_dict)

@app.put("/api/words/{word_id}", response_model=Word)
async def update_word(word_id: int, word: WordCreate, db: Session = Depends(get_db)):
    """Update an existing word"""
    db_word = db.query(WordDB).filter(WordDB.id == word_id).first()
    
    if not db_word:
        raise HTTPException(status_code=404, detail="Word not found")
    
    db_word.word = word.word
    db_word.definition = word.definition
    db_word.example = word.example
    db_word.language = word.language
    db_word.source_language = word.source_language
    db_word.tags = ",".join(word.tags) if word.tags else ""
    
    db.commit()
    db.refresh(db_word)
    
    word_dict = {
        "id": db_word.id,
        "word": db_word.word,
        "definition": db_word.definition,
        "example": db_word.example,
        "language": db_word.language,
        "source_language": db_word.source_language,
        "tags": db_word.tags.split(",") if db_word.tags else [],
        "created_at": db_word.created_at
    }
    
    return Word(**word_dict)

@app.delete("/api/words/{word_id}")
async def delete_word(word_id: int, db: Session = Depends(get_db)):
    """Delete a word"""
    db_word = db.query(WordDB).filter(WordDB.id == word_id).first()
    
    if not db_word:
        raise HTTPException(status_code=404, detail="Word not found")
    
    db.delete(db_word)
    db.commit()
    
    return {"message": "Word deleted successfully"}

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get statistics"""
    total_words = db.query(WordDB).count()
    languages = db.query(WordDB.language).distinct().all()
    
    return {
        "total_words": total_words,
        "languages": [lang[0] for lang in languages],
        "language_count": len(languages)
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
