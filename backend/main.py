from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import Base, engine
from backend.routes import auth, admin, predictions, ngos, donations, analytics

# Attempt to create database tables
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Error creating database tables: {e}. Please ensure MySQL is running and configured correctly.")

app = FastAPI(
    title="Sustainable Food Redistribution Platform API",
    description="Backend API for surplus food prediction, routing, and tracking",
    version="1.0.0"
)

# Enable CORS for React + Vite development server (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Food Redistribution API is online",
        "status": "healthy",
        "modules": [
            "Surplus Prediction",
            "Smart Routing",
            "Distribution & Impact Tracking"
        ]
    }

# Include Routers under the /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(ngos.router, prefix="/api")
app.include_router(donations.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

