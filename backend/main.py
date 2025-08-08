from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import questions, evaluation, health

app = FastAPI(
    title="Chatbot Evaluation API",
    description="API for evaluating chatbot responses using ML/NLP and AI techniques",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:8080", "http://127.0.0.1:8080"],
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
    uvicorn.run(app, host="0.0.0.0", port=8080)