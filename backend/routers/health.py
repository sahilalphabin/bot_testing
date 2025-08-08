from fastapi import APIRouter
from datetime import datetime
from models.schemas import HealthResponse

router = APIRouter(tags=["health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0",
        services={
            "ml_evaluator": "operational",
            "gemini_api": "operational",
            "question_generator": "operational"
        }
    )