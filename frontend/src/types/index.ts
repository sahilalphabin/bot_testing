export interface Question {
  id: string;
  text: string;
  category: 'general' | 'safety' | 'technical' | 'creative';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface EvaluationDetails {
  similarity: number;
  completeness: number;
  accuracy: number;
  relevance: number;
  clarity?: number;
  readability?: number;
  toxicity?: number;
  bias?: number;
  sentiment?: number;
  intent_match?: number;
  factual_consistency?: number;
  entity_f1?: number;
  refusal_compliance?: number;
  numeric_consistency?: number;
  length_adequacy?: number;
}

export interface MLMetrics {
  unified_similarity?: number;
  method_scores?: Record<string, number>;
  methods_used?: number;
  rouge_scores?: {
    rouge1_f: number;
    rouge2_f: number;
    rougeL_f: number;
  };
  entity_metrics?: {
    precision: number;
    recall: number;
    f1: number;
  };
  structure_metrics?: {
    type_token_ratio: number;
    repetition_score: number;
    formatting_score: number;
  };
  readability_score?: number;
  grammar_errors?: number;
  sentiment_compound?: number;
  toxicity_hits?: string[];
  intent_probs?: Record<string, number>;
  factual_hits_count?: number;
  numeric_issues_count?: number;
  missing_entities_count?: number;
  category?: string;
  precision?: number;
  recall?: number;
  f1?: number;
  jaccard?: number;
  ngram_overlap?: number;
  char_overlap?: number;
}

export interface GeminiMetrics {
  method_scores?: Record<string, number>;
  strengths?: string[];
  weaknesses?: string[];
  top_k_evidence?: Array<{
    source: string;
    title: string;
    snippet: string;
    score: number;
    url?: string;
  }>;
  hallucination_flags?: {
    is_hallucinated: boolean;
    reasons: string[];
  };
}

export interface EvaluationTrace {
  ml?: {
    retrieval_hits?: any[];
    grammar_issues_count?: number;
    missing_entities?: string[];
    numeric_issues?: any[];
    refusal_info?: {
      is_safety_question: boolean;
      refusal_detected: boolean;
      refusal_count: number;
      instruction_count: number;
      compliance_score: number;
    };
    method_weights?: Record<string, number>;
    fallbacks_used?: {
      spacy_available: boolean;
      rouge_available: boolean;
      vader_available: boolean;
      language_tool_available: boolean;
    };
    category_detected?: string;
  };
  gemini?: {
    top_k_evidence?: any[];
    hallucination_flags?: any;
  };
}

export interface EvaluationResults {
  ml_score?: number;
  gemini_score?: number;
  combined_score?: number;
  details: EvaluationDetails;
  explanations: {
    ml_explanation: string;
    gemini_explanation: string;
  };
  processing_time: number;
  ml_details?: EvaluationDetails;
  gemini_details?: EvaluationDetails;
  ml_metrics?: MLMetrics;
  gemini_metrics?: GeminiMetrics;
  trace?: EvaluationTrace;
  weights?: Record<string, number>;
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

// Filter types for dashboard analytics
export interface DashboardFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: Array<'general' | 'safety' | 'technical' | 'creative'>;
  difficulties?: Array<'easy' | 'medium' | 'hard'>;
  evaluationTypes?: Array<'ml' | 'gemini' | 'both'>;
  scoreRange?: {
    min: number;
    max: number;
  };
}

// Analytics insight card
export interface InsightCard {
  id: string;
  title: string;
  description: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  severity?: 'info' | 'warning' | 'critical';
  category: string;
}

// Chart data interfaces
export interface ChartDataPoint {
  [key: string]: any;
}

export interface HeatmapDataPoint {
  category: string;
  dimension: string;
  value: number;
  count: number;
}

export interface ScatterDataPoint {
  x: number;
  y: number;
  category?: string;
  difficulty?: string;
  id?: string;
}