from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import questions, evaluation, health
import os

FRONTEND_URL = os.getenv("FRONTEND_URL")
PORT = os.getenv("PORT")

app = FastAPI(
    title="Chatbot Evaluation API",
    description="API for evaluating chatbot responses using ML/NLP and AI techniques",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(evaluation.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Chatbot Evaluation API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)