"""
Скрипт для заполнения базы данных тестовыми пользователями и их словами
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from datetime import datetime
import os
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Настройка базы данных
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wilddict.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Настройка хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Импорт моделей из main.py
from main import UserDB, WordDB, Base

def seed_database():
    """Заполнение базы данных тестовыми данными"""
    db = SessionLocal()
    
    try:
        # Создание тестовых пользователей
        users_data = [
            {
                "email": "user1@example.com",
                "username": "Alice",
                "password": "password123"
            },
            {
                "email": "user2@example.com",
                "username": "Bob",
                "password": "password123"
            },
            {
                "email": "user3@example.com",
                "username": "Charlie",
                "password": "password123"
            }
        ]
        
        users = []
        for user_data in users_data:
            # Проверяем, существует ли пользователь
            existing_user = db.query(UserDB).filter(UserDB.email == user_data["email"]).first()
            if existing_user:
                print(f"Пользователь {user_data['username']} уже существует, пропускаем...")
                users.append(existing_user)
                continue
            
            # Создаем нового пользователя
            hashed_password = pwd_context.hash(user_data["password"])
            user = UserDB(
                email=user_data["email"],
                username=user_data["username"],
                hashed_password=hashed_password,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            users.append(user)
            print(f"✅ Создан пользователь: {user.username} ({user.email})")
        
        # Слова для Alice (пользователь 1)
        alice_words = [
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
                "word": "Schadenfreude",
                "definition": "Pleasure derived from another person's misfortune",
                "example": "I felt a bit of schadenfreude when my rival failed the test.",
                "language": "German",
                "source_language": "Russian",
                "tags": "noun,emotion"
            }
        ]
        
        # Слова для Bob (пользователь 2)
        bob_words = [
            {
                "word": "Konnichiwa",
                "definition": "Hello, good afternoon (Japanese greeting)",
                "example": "She greeted everyone with a cheerful 'Konnichiwa!'",
                "language": "Japanese",
                "source_language": "Russian",
                "tags": "greeting,phrase"
            },
            {
                "word": "Arigato",
                "definition": "Thank you in Japanese",
                "example": "Arigato gozaimasu for your help!",
                "language": "Japanese",
                "source_language": "Russian",
                "tags": "gratitude,phrase"
            },
            {
                "word": "Bonjour",
                "definition": "Good morning/Hello in French",
                "example": "Bonjour! Comment allez-vous?",
                "language": "French",
                "source_language": "Russian",
                "tags": "greeting,phrase"
            }
        ]
        
        # Слова для Charlie (пользователь 3)
        charlie_words = [
            {
                "word": "Lagom",
                "definition": "Just the right amount, not too much, not too little (Swedish)",
                "example": "The Swedish concept of lagom promotes balance in life.",
                "language": "Swedish",
                "source_language": "Russian",
                "tags": "adjective,philosophy"
            },
            {
                "word": "Saudade",
                "definition": "A deep emotional state of nostalgic longing (Portuguese)",
                "example": "She felt saudade for her hometown.",
                "language": "Portuguese",
                "source_language": "Russian",
                "tags": "noun,emotion"
            },
            {
                "word": "Hygge",
                "definition": "A quality of coziness that makes a person feel content (Danish)",
                "example": "We created hygge by lighting candles and drinking hot cocoa.",
                "language": "Danish",
                "source_language": "Russian",
                "tags": "noun,lifestyle"
            }
        ]
        
        # Добавление слов для каждого пользователя
        words_by_user = [
            (users[0], alice_words),
            (users[1], bob_words),
            (users[2], charlie_words)
        ]
        
        for user, words_list in words_by_user:
            for word_data in words_list:
                # Проверяем, существует ли слово у этого пользователя
                existing_word = db.query(WordDB).filter(
                    WordDB.word == word_data["word"],
                    WordDB.user_id == user.id
                ).first()
                
                if existing_word:
                    print(f"  Слово '{word_data['word']}' у пользователя {user.username} уже существует, пропускаем...")
                    continue
                
                word = WordDB(
                    word=word_data["word"],
                    definition=word_data["definition"],
                    example=word_data["example"],
                    language=word_data["language"],
                    source_language=word_data["source_language"],
                    tags=word_data["tags"],
                    user_id=user.id
                )
                db.add(word)
            
            db.commit()
            print(f"✅ Добавлено {len(words_list)} слов для пользователя {user.username}")
        
        print("\n🎉 База данных успешно заполнена!")
        print("\nДанные для входа:")
        for user_data in users_data:
            print(f"  Email: {user_data['email']}, Password: {user_data['password']}")
        
    except Exception as e:
        print(f"❌ Ошибка при заполнении базы данных: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Запуск скрипта заполнения базы данных...\n")
    seed_database()
