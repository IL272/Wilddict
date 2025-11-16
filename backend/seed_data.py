"""Seed database with sample words"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import WordDB, Base

SQLALCHEMY_DATABASE_URL = "sqlite:///./wilddict.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Sample data
sample_words = [
    {
        "word": "Serendipity",
        "definition": "The occurrence of events by chance in a happy or beneficial way",
        "example": "Finding that book in the old bookstore was pure serendipity.",
        "language": "English",
        "source_language": "Spanish",
        "tags": "noun,abstract"
    },
    {
        "word": "Gemütlichkeit",
        "definition": "A state of warmth, friendliness, and good cheer",
        "example": "The café had an atmosphere of gemütlichkeit that made everyone feel welcome.",
        "language": "German",
        "source_language": "English",
        "tags": "noun,feeling"
    },
    {
        "word": "Komorebi",
        "definition": "Sunlight filtering through trees",
        "example": "The komorebi created beautiful patterns on the forest floor.",
        "language": "Japanese",
        "source_language": "English",
        "tags": "noun,nature"
    },
    {
        "word": "Saudade",
        "definition": "A deep emotional state of nostalgic longing for something or someone",
        "example": "She felt saudade for her hometown every autumn.",
        "language": "Portuguese",
        "source_language": "English",
        "tags": "noun,emotion"
    },
    {
        "word": "Lagom",
        "definition": "Not too much, not too little; just right",
        "example": "Swedish culture embraces the concept of lagom in daily life.",
        "language": "Swedish",
        "source_language": "English",
        "tags": "adjective,philosophy"
    }
]

def seed_database():
    """Add sample words to database"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing = db.query(WordDB).first()
        if existing:
            print("Database already has data. Skipping seed.")
            return
        
        # Add sample words
        for word_data in sample_words:
            db_word = WordDB(**word_data)
            db.add(db_word)
        
        db.commit()
        print(f"Successfully added {len(sample_words)} words to database!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
