'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Evaluation, Question, DashboardStats } from '@/types';
import { LocalStorageManager } from '@/lib/localStorage';

interface DataContextType {
  evaluations: Evaluation[];
  questions: Question[];
  statistics: DashboardStats;
  addEvaluation: (evaluation: Evaluation) => void;
  deleteEvaluation: (id: string) => void;
  getEvaluationById: (id: string) => Evaluation | null;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [statistics, setStatistics] = useState<DashboardStats>({
    total_evaluations: 0,
    average_score: 0,
    pass_rate: 0,
    recent_evaluations: []
  });

  const refreshData = () => {
    const loadedEvaluations = LocalStorageManager.getEvaluations();
    const loadedQuestions = LocalStorageManager.getQuestions();
    const loadedStats = LocalStorageManager.getStatistics();
    
    setEvaluations(loadedEvaluations);
    setQuestions(loadedQuestions);
    setStatistics(loadedStats);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addEvaluation = (evaluation: Evaluation) => {
    LocalStorageManager.addEvaluation(evaluation);
    refreshData();
  };

  const deleteEvaluation = (id: string) => {
    LocalStorageManager.deleteEvaluation(id);
    refreshData();
  };

  const getEvaluationById = (id: string): Evaluation | null => {
    return LocalStorageManager.getEvaluationById(id);
  };

  const value = {
    evaluations,
    questions,
    statistics,
    addEvaluation,
    deleteEvaluation,
    getEvaluationById,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}