from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import Question, QuestionGenerationRequest
from services.question_generator import QuestionGenerator

router = APIRouter(tags=["questions"])
question_generator = QuestionGenerator()

@router.get("/questions", response_model=List[Question])
async def get_predefined_questions():
    """Get list of predefined questions"""
    return question_generator.get_predefined_questions()

@router.post("/questions/generate", response_model=List[Question])
async def generate_questions(request: QuestionGenerationRequest):
    """Generate dynamic questions based on criteria"""
    try:
        questions = await question_generator.generate_questions(
            category=request.category,
            count=request.count,
            difficulty=request.difficulty
        )
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@router.get("/questions/categories")
async def get_question_categories():
    """Get available question categories"""
    return {
        "categories": ["general", "safety", "technical", "creative"],
        "difficulties": ["easy", "medium", "hard"]
    }