# road/backend/app/main.py

# import sys
# import os

# project_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# if project_backend_dir not in sys.path:
#     sys.path.insert(0, project_backend_dir)

# print(f"DEBUG: Current working directory: {os.getcwd()}")
# print(f"DEBUG: __file__: {__file__}")
# print(f"DEBUG: Calculated project_backend_dir: {project_backend_dir}")
# print(f"DEBUG: sys.path after modification: {sys.path}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.core.config import settings
from app.api.v1.endpoints import llm_playground, prompts, rag_builder
from app.db.session import engine
from app.db.models import Base

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Handles startup and shutdown events.
    """
    # Startup
    print("🚀 Starting ROAD Platform...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    print("📊 Database tables created/verified")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down ROAD Platform...")

# Create FastAPI app instance
app = FastAPI(
    title="ROAD - RAG Orchestration & Application Development",
    description="A comprehensive platform for building, testing, and deploying RAG systems",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Root endpoint with basic information."""
    return {
        "message": "Welcome to ROAD Platform",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database": "connected",
        "timestamp": "2024-01-01T00:00:00Z"
    }

# Include API routers
app.include_router(
    llm_playground.router,
    prefix="/api/v1/llm",
    tags=["LLM Playground"]
)

app.include_router(
    prompts.router,
    prefix="/api/v1/prompts",
    tags=["Prompt Management"]
)

app.include_router(
    rag_builder.router,
    prefix="/api/v1/rag-builder",
    tags=["RAG Builder"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 