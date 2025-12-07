from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime, timedelta
from typing import List, Optional
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import JWTError, jwt
import uvicorn
import os

# Load environment variables
load_dotenv()

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wilddict.db")

# For Railway PostgreSQL compatibility
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database models
class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

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
    user_id = Column(Integer, nullable=False, index=True)  # Required: link words to users

Base.metadata.create_all(bind=engine)

# Pydantic models for authentication
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class User(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Pydantic models for words
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
    
    model_config = ConfigDict(from_attributes=True)

# FastAPI app
app = FastAPI(
    title="WildDict API",
    description="AI-powered visual dictionary backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "https://il272.github.io",
        "*"  # Remove in production after setting proper domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security helpers
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(lambda: next(get_db()))) -> UserDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = db.query(UserDB).filter(UserDB.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

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

# Authentication routes
@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(UserDB).filter(
        (UserDB.email == user_data.email) | (UserDB.username == user_data.username)
    ).first()
    
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = UserDB(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    user = db.query(UserDB).filter(UserDB.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=User)
async def get_current_user_info(current_user: UserDB = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.get("/api/words", response_model=List[Word])
async def get_words(
    skip: int = 0,
    limit: int = 100,
    language: Optional[str] = None,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all words for the current user with optional filtering"""
    query = db.query(WordDB).filter(WordDB.user_id == current_user.id)
    
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
async def get_word(
    word_id: int,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific word by ID (only if it belongs to current user)"""
    word = db.query(WordDB).filter(
        WordDB.id == word_id,
        WordDB.user_id == current_user.id
    ).first()
    
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
async def create_word(
    word: WordCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new word for the current user"""
    db_word = WordDB(
        word=word.word,
        definition=word.definition,
        example=word.example,
        language=word.language,
        source_language=word.source_language,
        tags=",".join(word.tags) if word.tags else "",
        user_id=current_user.id
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
async def update_word(
    word_id: int,
    word: WordCreate,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing word (only if it belongs to current user)"""
    db_word = db.query(WordDB).filter(
        WordDB.id == word_id,
        WordDB.user_id == current_user.id
    ).first()
    
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
async def delete_word(
    word_id: int,
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a word (only if it belongs to current user)"""
    db_word = db.query(WordDB).filter(
        WordDB.id == word_id,
        WordDB.user_id == current_user.id
    ).first()
    
    if not db_word:
        raise HTTPException(status_code=404, detail="Word not found")
    
    db.delete(db_word)
    db.commit()
    
    return {"message": "Word deleted successfully"}

@app.get("/api/stats")
async def get_stats(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get statistics for current user's words"""
    total_words = db.query(WordDB).filter(WordDB.user_id == current_user.id).count()
    languages = db.query(WordDB.language).filter(WordDB.user_id == current_user.id).distinct().all()
    
    return {
        "total_words": total_words,
        "languages": [lang[0] for lang in languages],
        "language_count": len(languages)
    }

@app.post("/api/seed-demo-data")
async def seed_demo_data(
    current_user: UserDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add demo words for current user"""
    # Проверяем, есть ли уже слова у пользователя
    existing_words_count = db.query(WordDB).filter(WordDB.user_id == current_user.id).count()
    if existing_words_count > 0:
        return {"message": f"User already has {existing_words_count} words", "added": 0}
    
    # Демонстрационные слова
    demo_words = [
        {
            "word": "Serendipity",
            "definition": "The occurrence of events by chance in a happy or beneficial way",
            "example": "Finding that book in the old bookstore was pure serendipity.",
            "language": "English",
            "source_language": "Russian",
            "tags": "noun,abstract"
        },
        {
            "word": "Wanderlust",
            "definition": "A strong desire to travel and explore the world",
            "example": "Her wanderlust took her to over 30 countries.",
            "language": "English",
            "source_language": "Russian",
            "tags": "noun,travel"
        },
        {
            "word": "Hygge",
            "definition": "A quality of coziness that makes a person feel content",
            "example": "We created hygge by lighting candles and drinking hot cocoa.",
            "language": "Danish",
            "source_language": "Russian",
            "tags": "noun,lifestyle"
        },
        {
            "word": "Saudade",
            "definition": "A deep emotional state of nostalgic longing",
            "example": "She felt saudade for her hometown.",
            "language": "Portuguese",
            "source_language": "Russian",
            "tags": "noun,emotion"
        },
        {
            "word": "Schadenfreude",
            "definition": "Pleasure derived from another person's misfortune",
            "example": "I felt a bit of schadenfreude when my rival failed the test.",
            "language": "German",
            "source_language": "Russian",
            "tags": "noun,emotion"
        }
    ]
    
    added_count = 0
    for word_data in demo_words:
        word = WordDB(
            word=word_data["word"],
            definition=word_data["definition"],
            example=word_data["example"],
            language=word_data["language"],
            source_language=word_data["source_language"],
            tags=word_data["tags"],
            user_id=current_user.id
        )
        db.add(word)
        added_count += 1
    
    db.commit()
    return {"message": f"Added {added_count} demo words for {current_user.username}", "added": added_count}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
