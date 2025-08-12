const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface EvaluationRequest {
  question: string;
  chatbot_answer: string;
  manual_answer: string;
  evaluation_type?: 'ml' | 'gemini' | 'both';
}

export interface EvaluationResponse {
  ml_score?: number;
  gemini_score?: number;
  combined_score?: number;
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
  processing_time: number;
  ml_details?: Record<string, number>;
  gemini_details?: Record<string, number>;
  ml_metrics?: Record<string, any>;
  gemini_metrics?: Record<string, any>;
  trace?: Record<string, any>;
  weights?: Record<string, number>;
}

export interface Question {
  id: string;
  text: string;
  category: 'general' | 'safety' | 'technical' | 'creative';
  difficulty: 'easy' | 'medium' | 'hard';
  standard_answers?: string[];
}

export const apiClient = {
  async evaluateResponse(request: EvaluationRequest): Promise<EvaluationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Evaluation failed: ${response.statusText}`);
    }

    return response.json();
  },

  async getQuestions(): Promise<Question[]> {
    const response = await fetch(`${API_BASE_URL}/api/questions`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    return response.json();
  },

  async generateQuestions(category: string, count: number = 5): Promise<Question[]> {
    const response = await fetch(`${API_BASE_URL}/api/questions/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, count }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate questions: ${response.statusText}`);
    }

    return response.json();
  },

  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json();
  },
};