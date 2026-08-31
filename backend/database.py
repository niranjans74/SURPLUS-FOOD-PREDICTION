import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "admin")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "food_redistribution")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./food_redistribution.db"
)

# Robust database engine initialization
is_sqlite = DATABASE_URL.startswith("sqlite")
try:
    if is_sqlite:
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
    else:
        print(f"Attempting to connect to database at {DATABASE_URL}...")
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True
        )
        # Test connection
        conn = engine.connect()
        conn.close()
        print("Database connection succeeded.")
except Exception as e:
    print(f"Database connection failed: {e}")
    if not is_sqlite:
        print("Fallback activated: Initializing SQLite database (food_redistribution.db) for local execution.")
        DATABASE_URL = "sqlite:///./food_redistribution.db"
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False}
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
