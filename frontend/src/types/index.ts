export interface Question {
  id: string;
  text: string;
  category: 'general' | 'safety' | 'technical' | 'creative';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface EvaluationResults {
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

export interface EvaluationMetadata {
  processing_time: number;
  created_by: string;
  tags?: string[];
}

export interface Evaluation {
  id: string;
  timestamp: string;
  question: Question;
  chatbot_answer: string;
  manual_answer: string;
  evaluation_results: EvaluationResults;
  metadata?: EvaluationMetadata;
}

export interface DashboardStats {
  total_evaluations: number;
  average_score: number;
  pass_rate: number;
  recent_evaluations: Evaluation[];
}