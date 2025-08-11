# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## System Overview

This is a **Chatbot Evaluation System** - a web application that evaluates chatbot responses using dual analysis: lightweight ML/NLP techniques (15+ metrics) and Google Gemini AI integration. Built as a rapid prototype with FastAPI backend and Next.js frontend, using LocalStorage for client-side persistence.

## Development Commands

### Backend Development
```bash
# Start backend server (automated setup)
./start-backend.sh

# Manual backend startup  
cd backend
source .venv/bin/activate
pip install -r requirements-light.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload

# Backend runs on http://localhost:8080
# Health check: GET /api/health
```

### Frontend Development
```bash
# Start frontend (automated setup)
./start-frontend.sh

# Manual frontend startup
cd frontend
npm install  # or bun install  
npm run dev  # or bun run dev

# Frontend runs on http://localhost:3000
# Uses bun for package management
```

### Testing
```bash
# Backend testing
cd backend
python test_lightweight_ml.py

# Frontend testing  
cd frontend
npm run build    # Check for build errors
npm run lint     # ESLint validation
```

## Architecture

### Backend Structure (FastAPI)
- **`main.py`** - FastAPI app with CORS configuration
- **`routers/`** - API endpoints (evaluation, questions, health)  
- **`services/`** - Core business logic:
  - `ml_evaluator_lightweight.py` - 15+ ML/NLP evaluation metrics
  - `gemini_evaluator.py` - Google Gemini AI integration
  - `question_generator.py` - 80+ predefined questions + dynamic generation
- **`models/schemas.py`** - Pydantic request/response models

### Frontend Structure (Next.js 15 + App Router)
- **`app/`** - Next.js pages (dashboard, evaluate, analytics)
- **`components/charts/`** - 10+ specialized chart components for data visualization
- **`context/DataContext.tsx`** - React Context managing evaluation state and LocalStorage
- **`lib/api.ts`** - Backend API client functions
- **`types/index.ts`** - TypeScript interfaces for evaluations, questions, metrics

## Key API Endpoints

- `POST /api/evaluate` - Full dual evaluation (ML + Gemini)
- `POST /api/evaluate/ml` - ML/NLP evaluation only
- `POST /api/evaluate/gemini` - Gemini evaluation only  
- `GET /api/questions` - Get 80+ predefined questions by category
- `POST /api/questions/generate` - Generate dynamic questions

## Data Flow

```
User Input → React Forms → DataContext → LocalStorage ↔ FastAPI Backend → ML/Gemini Processing → Results Storage → Chart Visualization
```

## Evaluation System

### ML/NLP Evaluator (15+ Metrics)
- **Semantic similarity** - TF-IDF, spaCy embeddings, custom algorithms
- **Accuracy metrics** - BLEU-like scoring, lexical precision/recall/F1
- **Content analysis** - Completeness, relevance, readability (Flesch-Kincaid)
- **Advanced metrics** - ROUGE scores, entity agreement (NER), numeric consistency
- **Safety analysis** - Toxicity detection, bias estimation, refusal compliance
- **Category-specific weighting** - Different score weights for safety/technical/creative/general questions

### Question Categories
- **Safety** (20+ questions) - Harmful content, bias testing, prompt injection
- **Technical** (20+ questions) - Programming, algorithms, factual knowledge
- **Creative** (20+ questions) - Storytelling, creative writing, ideation
- **General** (20+ questions) - Common knowledge, reasoning, conversation

## Data Storage

- **No database** - Uses LocalStorage for rapid prototyping
- **Client-side persistence** - All evaluation data stored in browser
- **Export capabilities** - Data can be exported for external analysis
- **Demo data generation** - Built-in sample data for testing

## Configuration

### Environment Variables
- `GEMINI_API_KEY` - Google Gemini API key (optional, falls back to mock)
- `FRONTEND_URL` - CORS configuration 
- `PORT` - Backend port (default: 8080)

### Dependencies
- **Backend**: FastAPI + lightweight ML stack (~50MB total)
- **Frontend**: Next.js 15 + Shadcn UI + Recharts for visualization
- **Optional ML models**: ONNX Runtime, spaCy medium model for enhanced accuracy

## Development Notes

### ML Model Loading
The system gracefully degrades when optional ML dependencies aren't available:
- ONNX models load from `backend/models/` directory when available
- spaCy medium model enhances entity recognition and similarity calculations
- System works with basic TF-IDF and custom algorithms as fallbacks

### State Management  
- React Context (`DataContext`) manages all evaluation state
- LocalStorage automatically persists evaluation history
- Charts and analytics update in real-time as new evaluations are added

### Chart System
10+ specialized chart components in `components/charts/`:
- Score distribution charts, radar charts for multi-dimensional analysis
- Evaluator comparison charts, safety compliance tracking
- All charts built with Recharts and handle empty/loading states

### Safety Testing
Comprehensive safety question database covering:
- Harmful instruction detection, bias and discrimination testing
- Privacy violation attempts, medical misinformation detection  
- Prompt injection vulnerability testing, illegal activity assistance

When working on this codebase, the dual evaluation system (ML + AI) provides comprehensive analysis, and the LocalStorage-based architecture allows for rapid development without database setup complexity.