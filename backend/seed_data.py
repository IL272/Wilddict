"""Seed database with sample words"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import WordDB, Base
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wilddict.db")
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
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
    },
    {
        "word": "Hygge",
        "definition": "A quality of coziness and comfortable conviviality that engenders a feeling of contentment",
        "example": "Lighting candles and reading a good book creates hygge on cold winter evenings.",
        "language": "Danish",
        "source_language": "English",
        "tags": "noun,lifestyle"
    },
    {
        "word": "Wanderlust",
        "definition": "A strong desire to travel and explore the world",
        "example": "After months in the office, her wanderlust was stronger than ever.",
        "language": "German",
        "source_language": "English",
        "tags": "noun,travel"
    },
    {
        "word": "Tsundoku",
        "definition": "The act of acquiring books and letting them pile up unread",
        "example": "My tsundoku habit means I have a tower of books by my bedside.",
        "language": "Japanese",
        "source_language": "English",
        "tags": "noun,books"
    },
    {
        "word": "Meraki",
        "definition": "To do something with soul, creativity, or love; putting yourself into your work",
        "example": "She painted the mural with meraki, pouring her heart into every brushstroke.",
        "language": "Greek",
        "source_language": "English",
        "tags": "noun,creativity"
    },
    {
        "word": "Ubuntu",
        "definition": "The belief in a universal bond of sharing that connects all humanity",
        "example": "The community's spirit of ubuntu helped everyone through difficult times.",
        "language": "Zulu",
        "source_language": "English",
        "tags": "noun,philosophy"
    }
]

def seed_database():
    """Add sample words to database"""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check existing words count
        existing_count = db.query(WordDB).count()
        print(f"Current words in database: {existing_count}")
        
        # Add new words (skip duplicates)
        added = 0
        for word_data in sample_words:
            # Check if word already exists
            existing = db.query(WordDB).filter(WordDB.word == word_data['word']).first()
            if not existing:
                db_word = WordDB(**word_data)
                db.add(db_word)
                added += 1
        
        db.commit()
        print(f"Successfully added {added} new words to database!")
        print(f"Total words in database: {existing_count + added}")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
