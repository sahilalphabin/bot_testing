'use client';

import { useState, useEffect } from 'react';
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import { apiClient } from "@/lib/api";
import { Question, Evaluation } from '@/types';
import { cn } from '@/lib/utils';
import { Loader2, Plus, Send, X } from "lucide-react";
import { RadarDimensionsChart } from "@/components/charts/RadarDimensionsChart";
import { MethodBreakdownBar } from "@/components/charts/MethodBreakdownBar";

export default function EvaluatePage() {
  const { addEvaluation } = useData();
  
  // Form state
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [chatbotAnswer, setChatbotAnswer] = useState<string>('');
  const [manualAnswer, setManualAnswer] = useState<string>('');
  const [evaluationType, setEvaluationType] = useState<'both' | 'ml' | 'gemini'>('both');
  
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);
  const [showQuestionsList, setShowQuestionsList] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [loadingNewQuestions, setLoadingNewQuestions] = useState<boolean>(false);
  const [questionMode, setQuestionMode] = useState<'custom' | 'predefined'>('predefined');
  const [search, setSearch] = useState<string>("");
  const [difficulty, setDifficulty] = useState<'easy'|'medium'|'hard'|'all'>('all');
  const [results, setResults] = useState<{
    ml_score?: number;
    gemini_score?: number;
    combined_score?: number;
    details: { similarity: number; completeness: number; accuracy: number; relevance: number };
    explanations: { ml_explanation: string; gemini_explanation: string };
    processing_time: number;
    ml_details?: Record<string, number>;
    gemini_details?: Record<string, number>;
    ml_metrics?: Record<string, any>;
    gemini_metrics?: Record<string, any>;
    trace?: Record<string, any>;
    weights?: Record<string, number>;
  } | null>(null);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const fetchedQuestions = await apiClient.getQuestions();
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Failed to load questions:', error);
      // Use default questions as fallback
      setQuestions([
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
      ]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const generateNewQuestions = async (category: string) => {
    try {
      setLoadingNewQuestions(true);
      const newQuestions = await apiClient.generateQuestions(category, 10);
      setGeneratedQuestions(newQuestions);
      setShowQuestionsList(true);
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setLoadingNewQuestions(false);
    }
  };

  const selectQuestion = (question: Question) => {
    setSelectedQuestionId(question.id);
    setCustomQuestion('');
    // Add to questions list if not already present
    if (!questions.find(q => q.id === question.id)) {
      setQuestions(prev => [...prev, question]);
    }
    setShowQuestionsList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatbotAnswer.trim() || !manualAnswer.trim()) {
      return;
    }

    const questionText = questionMode === 'predefined' && selectedQuestionId 
      ? questions.find(q => q.id === selectedQuestionId)?.text || ''
      : customQuestion;

    if (!questionText.trim()) {
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const evaluationResult = await apiClient.evaluateResponse({
        question: questionText,
        chatbot_answer: chatbotAnswer,
        manual_answer: manualAnswer,
        evaluation_type: evaluationType
      });

      // Create evaluation object
      const evaluation: Evaluation = {
        id: `eval_${Date.now()}`,
        timestamp: new Date().toISOString(),
        question: questionMode === 'predefined' && selectedQuestionId 
          ? questions.find(q => q.id === selectedQuestionId)! 
          : {
              id: `custom_${Date.now()}`,
              text: questionText,
              category: 'general',
              difficulty: 'medium'
            },
        chatbot_answer: chatbotAnswer,
        manual_answer: manualAnswer,
        evaluation_results: {
          ml_score: evaluationResult.ml_score || 0,
          gemini_score: evaluationResult.gemini_score || 0,
          combined_score: evaluationResult.combined_score || 0,
          details: evaluationResult.details,
          explanations: evaluationResult.explanations,
          processing_time: evaluationResult.processing_time
        },
        metadata: {
          processing_time: evaluationResult.processing_time,
          created_by: 'user'
        }
      };

      // Add to localStorage
      addEvaluation(evaluation);
      
      // Show results
      setResults(evaluationResult);
      
    } catch (error) {
      console.error('Evaluation failed:', error);
      // Handle error - you might want to show a toast or error message
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedQuestionId('');
    setCustomQuestion('');
    setChatbotAnswer('');
    setManualAnswer('');
    setResults(null);
    setShowQuestionsList(false);
    setGeneratedQuestions([]);
    setQuestionMode('predefined');
  };

  return (
    <div className="flex h-screen bg-[--color-background] text-[--color-foreground]">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 h-full">
            <div className="mb-6 sticky top-0 z-10 bg-[--color-background]/80 backdrop-blur supports-[backdrop-filter]:bg-[--color-background]/70">
              <h1 className="text-2xl font-bold">Evaluate Chatbot Response</h1>
              <p className="mt-1 text-[--color-muted-foreground]">
                Compare chatbot answers against ground truth using ML/NLP and AI evaluation
              </p>
            </div>

            <Card className="h-full bg-[--color-card] border border-[--color-border]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Chatbot Evaluation</CardTitle>
              </CardHeader>
              <CardContent className="h-full overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6 h-full">
                {/* Question Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Test Question</Label>
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                      <Button
                        type="button"
                        variant={questionMode === 'predefined' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          setQuestionMode('predefined');
                          setCustomQuestion('');
                        }}
                        className="rounded-md"
                      >
                        Predefined
                      </Button>
                      <Button
                        type="button"
                        variant={questionMode === 'custom' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          setQuestionMode('custom');
                          setSelectedQuestionId('');
                        }}
                        className="rounded-md"
                      >
                        Custom
                      </Button>
                    </div>
                  </div>
                  
                  {/* Predefined Controls */}
                  {questionMode === 'predefined' && (
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <Input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search questions..."
                          className="bg-[--color-input] border border-[--color-border]"
                        />
                        <Select value={difficulty} onValueChange={(v: any)=> setDifficulty(v)}>
                          <SelectTrigger className="w-40 bg-[--color-input] border border-[--color-border]">
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="outline" onClick={() => generateNewQuestions('general')}>Refresh</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generateNewQuestions('general')}
                      disabled={loadingNewQuestions}
                      className="justify-start h-12"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      General Knowledge
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generateNewQuestions('safety')}
                      disabled={loadingNewQuestions}
                      className="justify-start h-12"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Safety Testing
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generateNewQuestions('technical')}
                      disabled={loadingNewQuestions}
                      className="justify-start h-12 border-[--color-border] hover:bg-[--color-muted]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Technical Skills
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generateNewQuestions('creative')}
                      disabled={loadingNewQuestions}
                      className="justify-start h-12 border-[--color-border] hover:bg-[--color-muted]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Creative Tasks
                    </Button>
                      </div>
                    </div>
                  )}

                  {/* Custom Question */}
                  {questionMode === 'custom' && (
                    <div>
                      <Label className="text-sm font-medium">Enter your custom question:</Label>
                      <Input
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="Type your custom test question here..."
                        className="mt-2 bg-[--color-input] border border-[--color-border] focus-visible:ring-[--color-ring] placeholder:text-[--color-muted-foreground]"
                      />
                    </div>
                  )}

                  {/* Selected Question Display */}
                  {(selectedQuestionId || (questionMode === 'custom' && customQuestion)) && (
                    <div className="p-4 bg-[--color-muted] rounded-lg border border-[--color-border]">
                      <Label className="text-sm font-medium text-[--color-muted-foreground]">Selected Question:</Label>
                      <p className="mt-1 text-sm">
                        {questionMode === 'predefined' && selectedQuestionId 
                          ? questions.find(q => q.id === selectedQuestionId)?.text || ''
                          : customQuestion
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Answers */}
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="chatbot-answer" className="text-base font-medium">Chatbot Response</Label>
                    <Textarea
                      id="chatbot-answer"
                      value={chatbotAnswer}
                      onChange={(e) => setChatbotAnswer(e.target.value)}
                      placeholder="Paste the chatbot's response here..."
                      rows={5}
                      required
                      className="mt-2 resize-none bg-[--color-input] border border-[--color-border] focus-visible:ring-[--color-ring] placeholder:text-[--color-muted-foreground]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="manual-answer" className="text-base font-medium">Expected Answer (Ground Truth)</Label>
                    <Textarea
                      id="manual-answer"
                      value={manualAnswer}
                      onChange={(e) => setManualAnswer(e.target.value)}
                      placeholder="Enter the correct/expected answer here..."
                      rows={5}
                      required
                      className="mt-2 resize-none bg-[--color-input] border border-[--color-border] focus-visible:ring-[--color-ring] placeholder:text-[--color-muted-foreground]"
                    />
                  </div>
                </div>

                                {/* Evaluation Type */}
                <div>
                  <Label className="text-base font-medium">Evaluation Method</Label>
                  <Select value={evaluationType} onValueChange={(value: 'both' | 'ml' | 'gemini') => setEvaluationType(value)}>
                    <SelectTrigger className="mt-2 bg-[--color-input] border border-[--color-border] focus:ring-[--color-ring]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both ML/NLP and AI</SelectItem>
                      <SelectItem value="ml">ML/NLP Only</SelectItem>
                      <SelectItem value="gemini">AI Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading || (!chatbotAnswer.trim() || !manualAnswer.trim() || (questionMode === 'predefined' ? !selectedQuestionId : !customQuestion.trim()))}
                    className="flex-1 h-12 bg-[--color-primary] hover:opacity-90 text-[--color-primary-foreground]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Run Evaluation
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={resetForm}
                    disabled={isLoading}
                    className="px-6 border border-[--color-border] hover:bg-[--color-muted]"
                  >
                    Reset
                  </Button>
                </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Panel - Results */}
      <div className="flex-1 flex flex-col overflow-hidden border-l border-[--color-border] bg-[--color-card]">
        <div className="p-8 border-b border-[--color-border]">
          <h2 className="text-2xl font-bold">Evaluation Results</h2>
          <p className="mt-1 text-[--color-muted-foreground]">
            Real-time analysis and scoring metrics
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
            {!results ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-[--color-muted-foreground]">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[--color-muted] flex items-center justify-center">
                    <Send className="h-10 w-10" />
                  </div>
                  <p className="text-xl font-medium mb-2">Ready to Evaluate</p>
                  <p className="text-sm text-[--color-muted-foreground]">Fill out the form and click "Run Evaluation" to see results</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Overall Scores */}
                <div className="grid grid-cols-3 gap-6">
                  {results.ml_score !== undefined && (
                    <div className="text-center p-8 bg-[--color-card] rounded-2xl border border-[--color-border]">
                      <div className="text-4xl font-bold mb-2">{results.ml_score.toFixed(1)}</div>
                      <div className="text-sm font-medium text-[--color-muted-foreground]">ML/NLP Score</div>
                    </div>
                  )}
                  
                  {results.gemini_score !== undefined && (
                    <div className="text-center p-8 bg-[--color-card] rounded-2xl border border-[--color-border]">
                      <div className="text-4xl font-bold mb-2">{results.gemini_score.toFixed(1)}</div>
                      <div className="text-sm font-medium text-[--color-muted-foreground]">AI Score</div>
                    </div>
                  )}
                  
                  {results.combined_score !== undefined && (
                    <div className="text-center p-8 bg-[--color-card] rounded-2xl border border-[--color-border]">
                      <div className="text-4xl font-bold mb-2">{results.combined_score.toFixed(1)}</div>
                      <div className="text-sm font-medium text-[--color-muted-foreground]">Combined Score</div>
                    </div>
                  )}
                </div>

                {/* Detailed Metrics */}
                <div>
                  <h3 className="text-xl font-semibold mb-6">Detailed Metrics</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[--color-card] p-6 rounded-xl border border-[--color-border]">
                      <div className="text-sm font-medium text-[--color-muted-foreground] mb-2">Similarity</div>
                      <div className="text-3xl font-bold">{results.details.similarity.toFixed(1)}%</div>
                    </div>
                    <div className="bg-[--color-card] p-6 rounded-xl border border-[--color-border]">
                      <div className="text-sm font-medium text-[--color-muted-foreground] mb-2">Completeness</div>
                      <div className="text-3xl font-bold">{results.details.completeness.toFixed(1)}%</div>
                    </div>
                    <div className="bg-[--color-card] p-6 rounded-xl border border-[--color-border]">
                      <div className="text-sm font-medium text-[--color-muted-foreground] mb-2">Accuracy</div>
                      <div className="text-3xl font-bold">{results.details.accuracy.toFixed(1)}%</div>
                    </div>
                    <div className="bg-[--color-card] p-6 rounded-xl border border-[--color-border]">
                      <div className="text-sm font-medium text-[--color-muted-foreground] mb-2">Relevance</div>
                      <div className="text-3xl font-bold">{results.details.relevance.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

                {/* Advanced Analytics */}
                {(results.ml_details || results.gemini_details) && (
                  <div className="grid grid-cols-2 gap-6">
                    {/* ML Details */}
                    {results.ml_details && (
                      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">ML Details</h4>
                          <span className="text-xs text-gray-400">weights-aware</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {Object.entries(results.ml_details).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between text-gray-300">
                              <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                              <span className="text-white font-medium">{Number(v).toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Gemini Details */}
                    {results.gemini_details && (
                      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white">AI Details</h4>
                          <span className="text-xs text-gray-400">model-evaluated</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {Object.entries(results.gemini_details).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between text-gray-300">
                              <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                              <span className="text-white font-medium">{Number(v).toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanations */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="text-sm font-medium text-gray-400 mb-2">ML Explanation</div>
                    <p className="text-sm text-gray-200 leading-relaxed">{results.explanations.ml_explanation}</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <div className="text-sm font-medium text-gray-400 mb-2">AI Explanation</div>
                    <p className="text-sm text-gray-200 leading-relaxed">{results.explanations.gemini_explanation}</p>
                  </div>
                </div>

                {/* Method Scores and Evidence */}
                {(results.ml_metrics || results.gemini_metrics) && (
                  <div className="grid grid-cols-2 gap-6">
                    {/* ML Methods */}
                    {results.ml_metrics?.method_scores && (
                      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h4 className="text-lg font-semibold text-white mb-4">ML Method Scores</h4>
                        <div className="space-y-2 text-sm">
                          {Object.entries(results.ml_metrics.method_scores).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between text-gray-300">
                              <span className="uppercase">{k}</span>
                              <span className="text-white font-medium">{v as number}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Methods & Evidence */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                      <h4 className="text-lg font-semibold text-white mb-4">AI Insights</h4>
                      {results.gemini_metrics?.method_scores && (
                        <div className="space-y-2 text-sm mb-4">
                          {Object.entries(results.gemini_metrics.method_scores).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between text-gray-300">
                              <span className="uppercase">{k}</span>
                              <span className="text-white font-medium">{v as number}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {results.trace && (results.trace as any).gemini?.top_k_evidence && (
                        <div>
                          <div className="text-sm font-medium text-gray-400 mb-2">Top Evidence</div>
                          <ul className="space-y-2 text-sm">
                            {((results.trace as any).gemini.top_k_evidence as any[]).map((e, idx) => (
                              <li key={idx} className="text-gray-300">
                                <span className="text-white">{e.title || e.source}</span>
                                {e.score !== undefined && <span className="ml-2 text-gray-400">({e.score})</span>}
                                {e.url && (
                                  <a href={e.url} target="_blank" rel="noreferrer" className="ml-2 text-blue-400 hover:underline">link</a>
                                )}
                                {e.snippet && <div className="text-gray-400">{e.snippet}</div>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Radar & Method Comparison Charts */}
                <div className="grid grid-cols-2 gap-6">
                  <RadarDimensionsChart
                    ml={results.ml_details}
                    ai={results.gemini_details}
                    combined={(() => {
                      if (!results.ml_details || !results.gemini_details) return undefined;
                      const keys = new Set([...Object.keys(results.ml_details), ...Object.keys(results.gemini_details)]);
                      const out: Record<string, number> = {};
                      keys.forEach(k => {
                        const a = results.ml_details?.[k] ?? 0;
                        const b = results.gemini_details?.[k] ?? 0;
                        out[k] = (a + b) / 2;
                      });
                      return out;
                    })()}
                  />
                  <MethodBreakdownBar
                    ml={results.ml_metrics?.method_scores as Record<string, number>}
                    ai={results.gemini_metrics?.method_scores as Record<string, number>}
                  />
                </div>

                {/* Processing Time */}
                <div className="text-center text-sm text-gray-400 pt-6 border-t border-gray-700">
                  Processed in {results.processing_time.toFixed(2)} seconds
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Questions List Modal */}
      {showQuestionsList && (
        <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-[--color-card]/95 backdrop-blur-md rounded-lg max-w-4xl w-full max-h-[80vh] border border-[--color-border] shadow-lg text-white">
            <div className="flex items-center justify-between p-6 border-b border-[--color-border]">
              <h2 className="text-xl font-semibold">Select a Test Question</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuestionsList(false)}
                className="border border-[--color-border] text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingNewQuestions ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-[--color-muted-foreground] mb-4" />
                  <p className="text-[--color-muted-foreground]">Generating questions...</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {generatedQuestions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => selectQuestion(question)}
                      className="text-left p-4 rounded-lg border border-[--color-border] hover:bg-[--color-muted] transition-colors text-white"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-[--color-muted] text-[--color-muted-foreground]">
                          {question.category} • {question.difficulty}
                        </span>
                        <span className="text-xs text-[--color-muted-foreground]">#{index + 1}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{question.text}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}