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
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Robust database engine initialization with SQLite fallback
try:
    print(f"Attempting to connect to MySQL database at {DB_HOST}:{DB_PORT}...")
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 5} # Fast timeout to fallback quickly
    )
    # Test connection
    conn = engine.connect()
    conn.close()
    print("Database connection to MySQL succeeded.")
except Exception as e:
    print(f"MySQL connection failed: {e}")
    print("Fallback activated: Initializing SQLite database (food_redistribution.db) for local execution.")
    SQLITE_URL = "sqlite:///./food_redistribution.db"
    engine = create_engine(
        SQLITE_URL,
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
