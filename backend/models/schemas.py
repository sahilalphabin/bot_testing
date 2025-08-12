from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class QuestionBase(BaseModel):
    text: str
    category: str = Field(..., pattern="^(general|safety|technical|creative)$")
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")

class Question(QuestionBase):
    id: str
    standard_answers: Optional[List[str]] = None

class EvaluationRequest(BaseModel):
    question: str
    chatbot_answer: str
    manual_answer: str
    evaluation_type: str = "both"  # "ml", "gemini", or "both"

class EvaluationDetails(BaseModel):
    similarity: float
    completeness: float
    accuracy: float
    relevance: float

class EvaluationExplanations(BaseModel):
    ml_explanation: str
    gemini_explanation: str

class EvaluationResponse(BaseModel):
    ml_score: Optional[float] = None
    gemini_score: Optional[float] = None
    combined_score: Optional[float] = None
    details: EvaluationDetails
    explanations: EvaluationExplanations
    processing_time: float
    # Extended analytics (optional for backward compatibility)
    ml_details: Optional[Dict[str, float]] = None
    gemini_details: Optional[Dict[str, float]] = None
    ml_metrics: Optional[Dict[str, Any]] = None
    gemini_metrics: Optional[Dict[str, Any]] = None
    trace: Optional[Dict[str, Any]] = None
    weights: Optional[Dict[str, float]] = None

class QuestionGenerationRequest(BaseModel):
    category: str
    count: int = Field(default=5, ge=1, le=20)
    difficulty: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    services: Dict[str, str]