from fastapi import APIRouter, HTTPException, BackgroundTasks
from models.schemas import EvaluationRequest, EvaluationResponse
from services.ml_evaluator_lightweight import LightweightMLEvaluator
from services.gemini_evaluator import GeminiEvaluator
import time
import asyncio

router = APIRouter(tags=["evaluation"])

# Use lightweight ML evaluator instead of the heavy torch-based one
ml_evaluator = LightweightMLEvaluator()
gemini_evaluator = GeminiEvaluator()

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_response(request: EvaluationRequest):
    """Process evaluation request using both ML/NLP and Gemini evaluators"""
    start_time = time.time()
    
    try:
        tasks = []
        
        if request.evaluation_type in ["both", "ml"]:
            tasks.append(ml_evaluator.evaluate(
                request.question,
                request.chatbot_answer,
                request.manual_answer
            ))
        
        if request.evaluation_type in ["both", "gemini"]:
            tasks.append(gemini_evaluator.evaluate(
                request.question,
                request.chatbot_answer,
                request.manual_answer
            ))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        ml_result = None
        gemini_result = None
        
        if request.evaluation_type in ["both", "ml"]:
            ml_result = results[0] if not isinstance(results[0], Exception) else None
        
        if request.evaluation_type in ["both", "gemini"]:
            gemini_result = results[-1] if not isinstance(results[-1], Exception) else None
        
        # Calculate combined score
        combined_score = None
        if ml_result and gemini_result:
            combined_score = (ml_result["score"] + gemini_result["score"]) / 2
        elif ml_result:
            combined_score = ml_result["score"]
        elif gemini_result:
            combined_score = gemini_result["score"]
        
        processing_time = time.time() - start_time
        
        return EvaluationResponse(
            ml_score=ml_result["score"] if ml_result else None,
            gemini_score=gemini_result["score"] if gemini_result else None,
            combined_score=combined_score,
            details={
                "similarity": ml_result["details"]["similarity"] if ml_result else 0.0,
                "completeness": gemini_result["details"]["completeness"] if gemini_result else 0.0,
                "accuracy": ml_result["details"]["accuracy"] if ml_result else 0.0,
                "relevance": gemini_result["details"]["relevance"] if gemini_result else 0.0,
            },
            explanations={
                "ml_explanation": ml_result["explanation"] if ml_result else "ML evaluation not performed",
                "gemini_explanation": gemini_result["explanation"] if gemini_result else "Gemini evaluation not performed"
            },
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

@router.post("/evaluate/ml", response_model=dict)
async def evaluate_ml_only(request: EvaluationRequest):
    """Process evaluation using ML/NLP evaluator only"""
    try:
        result = await ml_evaluator.evaluate(
            request.question,
            request.chatbot_answer,
            request.manual_answer
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML evaluation failed: {str(e)}")

@router.post("/evaluate/gemini", response_model=dict)
async def evaluate_gemini_only(request: EvaluationRequest):
    """Process evaluation using Gemini evaluator only"""
    try:
        result = await gemini_evaluator.evaluate(
            request.question,
            request.chatbot_answer,
            request.manual_answer
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini evaluation failed: {str(e)}")