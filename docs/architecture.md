# Chatbot Evaluation System Architecture - LocalStorage Based

## Architecture Overview

Since you specified localStorage for data storage, here's the revised architecture optimized for client-side data persistence:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Dashboard     │  │   Form Site     │  │   Results       │ │
│  │    Page         │  │     Page        │  │     Page        │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                             │                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           Data Management Layer                             │ │
│  │  ┌─────────────────┐  ┌─────────────────┐                 │ │
│  │  │ LocalStorage    │  │  State Management│                 │ │
│  │  │   Manager       │  │   (React Context)│                 │ │
│  │  └─────────────────┘  └─────────────────┘                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Questions     │  │   Evaluation    │  │   ML/NLP        │ │
│  │   Service       │  │   Service       │  │   Service       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                             │                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                Stateless Services                          │ │
│  │     (No persistent storage - process only)                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Storage Architecture

### LocalStorage Structure

```javascript
// LocalStorage keys and data structure
{
  "chatbot_eval_evaluations": [
    {
      "id": "eval_1691234567890",
      "timestamp": "2025-08-08T10:30:00Z",
      "question": {
        "id": "q_001",
        "text": "What is artificial intelligence?",
        "category": "general"
      },
      "chatbot_answer": "AI is a field...",
      "manual_answer": "Artificial intelligence...",
      "evaluation_results": {
        "ml_score": 85,
        "gemini_score": 92,
        "combined_score": 88.5
      }
    }
  ],
  
  "chatbot_eval_questions": [
    {
      "id": "q_001",
      "text": "What is artificial intelligence?",
      "category": "general",
      "difficulty": "medium"
    }
  ],
  
  "chatbot_eval_settings": {
    "last_sync": "2025-08-08T10:30:00Z",
    "user_preferences": {},
    "dashboard_filters": {}
  }
}
```

## Frontend Architecture (Next.js)

### 1. Data Management Layer

**LocalStorage Manager**
```typescript
// utils/localStorage.ts
class LocalStorageManager {
  private static KEYS = {
    EVALUATIONS: 'chatbot_eval_evaluations',
    QUESTIONS: 'chatbot_eval_questions',
    SETTINGS: 'chatbot_eval_settings'
  };

  static saveEvaluations(evaluations: Evaluation[]): void
  static getEvaluations(): Evaluation[]
  static addEvaluation(evaluation: Evaluation): void
  static deleteEvaluation(id: string): void
  static getEvaluationById(id: string): Evaluation | null
}
```

**React Context for State Management**
```typescript
// context/DataContext.tsx
interface DataContextType {
  evaluations: Evaluation[];
  questions: Question[];
  addEvaluation: (evaluation: Evaluation) => void;
  updateEvaluation: (id: string, updates: Partial<Evaluation>) => void;
  deleteEvaluation: (id: string) => void;
  getStatistics: () => DashboardStats;
}
```

### 2. Component Architecture

**Page Components:**
- `app/page.tsx` - Dashboard with charts and statistics
- `app/evaluate/page.tsx` - Evaluation form
- `app/results/[id]/page.tsx` - Individual result view

**Shared Components:**
- `components/ui/` - Shadcn UI components
- `components/charts/` - Chart components using Recharts
- `components/forms/` - Form components with validation
- `components/layout/` - Navigation and layout components

### 3. Data Flow

```
User Action → Component → Context/State → LocalStorage → Backend API (for processing) → Update LocalStorage → Re-render UI
```

## Backend Architecture (FastAPI)

### 1. Stateless Service Design

Since data is stored in localStorage, the backend becomes purely stateless and focuses on processing:

**Service Structure:**
```
backend/
├── main.py                 # FastAPI app setup
├── routers/
│   ├── questions.py        # Question generation endpoints
│   ├── evaluation.py       # Evaluation processing endpoints
│   └── health.py          # Health check endpoints
├── services/
│   ├── ml_evaluator.py     # ML/NLP evaluation logic
│   ├── gemini_evaluator.py # Gemini API integration
│   └── question_generator.py # Dynamic question generation
├── models/
│   ├── schemas.py          # Pydantic request/response models
│   └── evaluation.py       # Evaluation data models
└── utils/
    ├── text_processing.py  # Text preprocessing utilities
    └── scoring.py          # Scoring algorithms
```

### 2. API Endpoints (Stateless)

**Question Management:**
- `GET /api/questions/predefined` - Return 20 predefined questions
- `POST /api/questions/generate` - Generate dynamic questions based on criteria

**Evaluation Processing:**
- `POST /api/evaluate/process` - Process evaluation (input: question, answers)
- `POST /api/evaluate/ml` - ML/NLP evaluation only
- `POST /api/evaluate/gemini` - Gemini evaluation only

**Utility Endpoints:**
- `GET /api/health` - Health check
- `POST /api/text/preprocess` - Text preprocessing utilities

### 3. Request/Response Flow

```
Frontend → API Request → Process Data → Return Results → Frontend Updates LocalStorage
```

## Data Models

### Frontend TypeScript Models

```typescript
interface Evaluation {
  id: string;
  timestamp: string;
  question: Question;
  chatbot_answer: string;
  manual_answer: string;
  evaluation_results: EvaluationResults;
  metadata?: EvaluationMetadata;
}

interface Question {
  id: string;
  text: string;
  category: 'general' | 'safety' | 'technical' | 'creative';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface EvaluationResults {
  ml_score: number;
  gemini_score: number;
  combined_score: number;
  details: {
    similarity: number;
    completeness: number;
    accuracy: number;
    relevance: number;
  };
  explanations: {
    ml_explanation: string;
    gemini_explanation: string;
  };
}
```

### Backend Pydantic Models

```python
from pydantic import BaseModel
from typing import Optional, Dict, Any

class EvaluationRequest(BaseModel):
    question: str
    chatbot_answer: str
    manual_answer: str
    evaluation_type: str = "both"  # "ml", "gemini", or "both"

class EvaluationResponse(BaseModel):
    ml_score: Optional[float]
    gemini_score: Optional[float]
    combined_score: Optional[float]
    details: Dict[str, float]
    explanations: Dict[str, str]
    processing_time: float
```

## LocalStorage Implementation Strategy

### 1. Data Persistence Patterns

**Immediate Persistence:**
- Save to localStorage after every data modification
- Use JSON serialization for complex objects
- Implement data validation before saving

**Data Synchronization:**
- Listen for storage events to sync between tabs
- Implement optimistic updates for better UX
- Handle localStorage quota exceeded errors

### 2. Performance Considerations

**Optimization Strategies:**
- Lazy load large datasets
- Implement pagination for evaluation lists
- Use data compression for large objects
- Cache frequently accessed data in memory

**Memory Management:**
- Limit localStorage to ~5MB (browser dependent)
- Implement data cleanup for old evaluations
- Monitor storage usage and warn users
