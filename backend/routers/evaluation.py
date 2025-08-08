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
            candidate = results[0]
            ml_result = candidate if not isinstance(candidate, Exception) else None
        
        if request.evaluation_type in ["both", "gemini"]:
            candidate = results[-1]
            gemini_result = candidate if not isinstance(candidate, Exception) else None
        
        # Calculate combined score (prefer ML weights if present)
        combined_score = None
        if ml_result and gemini_result:
            # If ML provides weights and details, compute a simple average of overall scores for now
            combined_score = (ml_result.get("score", 0.0) + gemini_result.get("score", 0.0)) / 2
        elif ml_result:
            combined_score = ml_result.get("score", None)
        elif gemini_result:
            combined_score = gemini_result.get("score", None)
        
        processing_time = time.time() - start_time
        
        # Build extended fields safely
        ml_details = ml_result.get("details") if ml_result else None
        ml_metrics = ml_result.get("metrics") if ml_result else None
        ml_trace = ml_result.get("trace") if ml_result else None
        ml_weights = ml_result.get("weights") if ml_result else None

        gem_details = gemini_result.get("details") if gemini_result else None
        gem_metrics = None
        if gemini_result:
            gem_metrics = {
                "method_scores": gemini_result.get("method_scores"),
                "strengths": gemini_result.get("strengths"),
                "weaknesses": gemini_result.get("weaknesses"),
            }
        gem_trace = None
        if gemini_result:
            gem_trace = {"gemini": {
                "top_k_evidence": gemini_result.get("top_k_evidence"),
                "hallucination_flags": gemini_result.get("hallucination_flags"),
            }}

        # Merge traces
        merged_trace = {}
        if ml_trace:
            merged_trace.update(ml_trace)
        if gem_trace:
            merged_trace.update(gem_trace)

        return EvaluationResponse(
            ml_score=ml_result.get("score") if ml_result else None,
            gemini_score=gemini_result.get("score") if gemini_result else None,
            combined_score=combined_score,
            details={
                "similarity": (ml_details or {}).get("similarity", 0.0),
                "completeness": (gem_details or {}).get("completeness", 0.0),
                "accuracy": (ml_details or {}).get("accuracy", 0.0),
                "relevance": (gem_details or {}).get("relevance", 0.0),
            },
            explanations={
                "ml_explanation": ml_result.get("explanation") if ml_result else "ML evaluation not performed",
                "gemini_explanation": gemini_result.get("explanation") if gemini_result else "Gemini evaluation not performed"
            },
            processing_time=processing_time,
            ml_details=ml_details,
            gemini_details=gem_details,
            ml_metrics=ml_metrics,
            gemini_metrics=gem_metrics,
            trace=merged_trace or None,
            weights=ml_weights
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