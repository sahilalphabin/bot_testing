import { Evaluation, Question, DashboardStats } from '@/types';

export class LocalStorageManager {
  private static KEYS = {
    EVALUATIONS: 'chatbot_eval_evaluations',
    QUESTIONS: 'chatbot_eval_questions',
    SETTINGS: 'chatbot_eval_settings'
  };

  static saveEvaluations(evaluations: Evaluation[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.EVALUATIONS, JSON.stringify(evaluations));
    }
  }

  static getEvaluations(): Evaluation[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.KEYS.EVALUATIONS);
    return stored ? JSON.parse(stored) : [];
  }

  static addEvaluation(evaluation: Evaluation): void {
    const evaluations = this.getEvaluations();
    evaluations.unshift(evaluation);
    this.saveEvaluations(evaluations);
  }

  static deleteEvaluation(id: string): void {
    const evaluations = this.getEvaluations();
    const filtered = evaluations.filter(evaluation => evaluation.id !== id);
    this.saveEvaluations(filtered);
  }

  static getEvaluationById(id: string): Evaluation | null {
    const evaluations = this.getEvaluations();
    return evaluations.find(evaluation => evaluation.id === id) || null;
  }

  static saveQuestions(questions: Question[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.KEYS.QUESTIONS, JSON.stringify(questions));
    }
  }

  static getQuestions(): Question[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem(this.KEYS.QUESTIONS);
    return stored ? JSON.parse(stored) : this.getDefaultQuestions();
  }

  private static getDefaultQuestions(): Question[] {
    return [
      {
        id: 'q1',
        text: 'What is artificial intelligence?',
        category: 'general',
        difficulty: 'medium'
      },
      {
        id: 'q2',
        text: 'Explain machine learning in simple terms.',
        category: 'technical',
        difficulty: 'easy'
      },
      {
        id: 'q3',
        text: 'How do neural networks work?',
        category: 'technical',
        difficulty: 'hard'
      }
    ];
  }

  static clearAllData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.KEYS.EVALUATIONS);
      localStorage.removeItem(this.KEYS.QUESTIONS);
    }
  }

  static getStatistics(): DashboardStats {
    const evaluations = this.getEvaluations();
    
    if (evaluations.length === 0) {
      return {
        total_evaluations: 0,
        average_score: 0,
        pass_rate: 0,
        recent_evaluations: []
      };
    }

    const totalScore = evaluations.reduce((sum, evaluation) => sum + evaluation.evaluation_results.combined_score, 0);
    const averageScore = totalScore / evaluations.length;
    const passCount = evaluations.filter(evaluation => evaluation.evaluation_results.combined_score >= 70).length;
    const passRate = (passCount / evaluations.length) * 100;

    return {
      total_evaluations: evaluations.length,
      average_score: Math.round(averageScore * 10) / 10,
      pass_rate: Math.round(passRate * 10) / 10,
      recent_evaluations: evaluations.slice(0, 5)
    };
  }
}