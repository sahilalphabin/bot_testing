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
import { Loader2, Plus, Send, X } from "lucide-react";

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
  const [showQuestionsList, setShowQuestionsList] = useState<boolean>(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [loadingNewQuestions, setLoadingNewQuestions] = useState<boolean>(false);
  const [questionMode, setQuestionMode] = useState<'custom' | 'predefined'>('predefined');
  const [results, setResults] = useState<{
    ml_score?: number;
    gemini_score?: number;
    combined_score?: number;
    details: { similarity: number; completeness: number; accuracy: number; relevance: number };
    explanations: { ml_explanation: string; gemini_explanation: string };
    weaknesses?: string[];
    explanation?: string;
    processing_time: number;
  } | null>(null);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
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
      
      // Show results (add mock weaknesses and explanation for demo)
      setResults({
        ...evaluationResult,
        weaknesses: ["Unsafe response.", "Poorly worded response to a clearly unethical request."],
        explanation: "The chatbot's answer is inadequate. The question is unethical. The chatbot response does not address the ethical concern. The response appears to be a deflection."
      });
      
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
    <div className="flex h-screen bg-white dark:bg-black">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-300 dark:border-gray-600">
        {/* <Navigation /> */}
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 h-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-black dark:text-white">Evaluate Chatbot Response</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Compare chatbot answers against ground truth using ML/NLP and AI evaluation
              </p>
            </div>

            <Card className="h-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-black dark:text-white">Chatbot Evaluation</CardTitle>
              </CardHeader>
              <CardContent className="h-full overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6 h-full">
                {/* Question Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium text-white">Test Question</Label>
                    <div className="flex items-center space-x-0 bg-gray-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionMode('predefined');
                          setCustomQuestion('');
                        }}
                        className={`px-4 py-2 text-sm rounded-md transition-colors ${
                          questionMode === 'predefined'
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        Predefined
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setQuestionMode('custom');
                          setSelectedQuestionId('');
                        }}
                        className={`px-4 py-2 text-sm rounded-md transition-colors ${
                          questionMode === 'custom'
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>
                  
                  {/* Generate Questions Buttons */}
                  {questionMode === 'predefined' && (
                    <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generateNewQuestions('general')}
                      disabled={loadingNewQuestions}
                      className="justify-start h-12 border-gray-600 hover:bg-gray-800 text-white bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      General Knowledge
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generateNewQuestions('safety')}
                      disabled={loadingNewQuestions}
                      className="justify-start h-12 border-gray-600 hover:bg-gray-800 text-white bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Safety Testing
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generateNewQuestions('technical')}
                      disabled={loadingNewQuestions}
                      className="justify-start h-12 border-gray-600 hover:bg-gray-800 text-white bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Technical Skills
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generateNewQuestions('creative')}
                      disabled={loadingNewQuestions}
                      className="justify-start h-12 border-gray-600 hover:bg-gray-800 text-white bg-gray-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Creative Tasks
                    </Button>
                    </div>
                  )}

                  {/* Custom Question */}
                  {questionMode === 'custom' && (
                    <div>
                      <Label className="text-sm font-medium text-white">Enter your custom question:</Label>
                      <Input
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="Type your custom test question here..."
                        className="mt-2 bg-gray-800 border-gray-600 focus-visible:ring-gray-400 text-white placeholder:text-gray-400"
                      />
                    </div>
                  )}

                  {/* Selected Question Display */}
                  {(selectedQuestionId || (questionMode === 'custom' && customQuestion)) && (
                    <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                      <Label className="text-sm font-medium text-gray-400">Selected Question:</Label>
                      <p className="mt-1 text-sm text-white">
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
                    <Label htmlFor="chatbot-answer" className="text-base font-medium text-white">Chatbot Response</Label>
                    <Textarea
                      id="chatbot-answer"
                      value={chatbotAnswer}
                      onChange={(e) => setChatbotAnswer(e.target.value)}
                      placeholder="Paste the chatbot's response here..."
                      rows={4}
                      required
                      className="mt-2 resize-none bg-gray-800 border-gray-600 focus-visible:ring-gray-400 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="manual-answer" className="text-base font-medium text-white">Expected Answer (Ground Truth)</Label>
                    <Textarea
                      id="manual-answer"
                      value={manualAnswer}
                      onChange={(e) => setManualAnswer(e.target.value)}
                      placeholder="Enter the correct/expected answer here..."
                      rows={4}
                      required
                      className="mt-2 resize-none bg-gray-800 border-gray-600 focus-visible:ring-gray-400 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Evaluation Type */}
                <div>
                  <Label className="text-base font-medium text-white">Evaluation Method</Label>
                  <Select value={evaluationType} onValueChange={(value: 'both' | 'ml' | 'gemini') => setEvaluationType(value)}>
                    <SelectTrigger className="mt-2 bg-gray-800 border-gray-600 focus:ring-gray-400 text-white">
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
                    className="flex-1 h-12 bg-white hover:bg-gray-200 text-black"
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
                    className="px-6 border-gray-600 hover:bg-gray-800 text-white"
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
      <div className="flex-1 flex flex-col overflow-hidden bg-black">
        <div className="p-8 border-b border-gray-600">
          <h2 className="text-2xl font-bold text-white">Evaluation Results</h2>
          <p className="mt-1 text-gray-400">
            Real-time analysis and scoring metrics
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
            {!results ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                    <Send className="h-10 w-10 text-gray-500" />
                  </div>
                  <p className="text-xl font-medium mb-2">Ready to Evaluate</p>
                  <p className="text-sm">Fill out the form and click &ldquo;Run Evaluation&rdquo; to see results</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Overall Scores */}
                <div className="grid grid-cols-3 gap-6">
                  {results.ml_score !== undefined && (
                    <div className="text-center p-8 bg-gray-800 rounded-2xl border border-gray-600">
                      <div className="text-4xl font-bold text-white mb-2">{results.ml_score.toFixed(1)}</div>
                      <div className="text-sm font-medium text-gray-400">ML/NLP Score</div>
                    </div>
                  )}
                  
                  {results.gemini_score !== undefined && (
                    <div className="text-center p-8 bg-gray-800 rounded-2xl border border-gray-600">
                      <div className="text-4xl font-bold text-white mb-2">{results.gemini_score.toFixed(1)}</div>
                      <div className="text-sm font-medium text-gray-400">AI Score</div>
                    </div>
                  )}
                  
                  {results.combined_score !== undefined && (
                    <div className="text-center p-8 bg-gray-800 rounded-2xl border border-gray-600">
                      <div className="text-4xl font-bold text-white mb-2">{results.combined_score.toFixed(1)}</div>
                      <div className="text-sm font-medium text-gray-400">Combined Score</div>
                    </div>
                  )}
                </div>

                {/* Detailed Metrics */}
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-white">Detailed Metrics</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-600">
                      <div className="text-sm font-medium text-gray-400 mb-2">Similarity</div>
                      <div className="text-3xl font-bold text-white">{results.details.similarity.toFixed(1)}%</div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-600">
                      <div className="text-sm font-medium text-gray-400 mb-2">Completeness</div>
                      <div className="text-3xl font-bold text-white">{results.details.completeness.toFixed(1)}%</div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-600">
                      <div className="text-sm font-medium text-gray-400 mb-2">Accuracy</div>
                      <div className="text-3xl font-bold text-white">{results.details.accuracy.toFixed(1)}%</div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-600">
                      <div className="text-sm font-medium text-gray-400 mb-2">Relevance</div>
                      <div className="text-3xl font-bold text-white">{results.details.relevance.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

                {/* Weaknesses Section */}
                {results.weaknesses && results.weaknesses.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Weaknesses</h3>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-600">
                      <ul className="space-y-2">
                        {results.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-white text-sm flex items-start">
                            <span className="text-red-400 mr-2">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Explanation Section */}
                {results.explanation && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Explanation</h3>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-600">
                      <p className="text-white text-sm leading-relaxed">{results.explanation}</p>
                    </div>
                  </div>
                )}

                {/* Processing Time */}
                <div className="text-center text-sm text-gray-400 pt-6 border-t border-gray-600">
                  Processed in {results.processing_time.toFixed(2)} seconds
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Questions List Modal */}
      {showQuestionsList && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-600">
            <div className="flex items-center justify-between p-6 border-b border-gray-600">
              <h2 className="text-xl font-semibold text-white">Select a Test Question</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuestionsList(false)}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingNewQuestions ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400 mb-4" />
                  <p className="text-gray-400">Generating questions...</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {generatedQuestions.map((question, index) => (
                    <button
                      key={question.id}
                      onClick={() => selectQuestion(question)}
                      className="text-left p-4 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                          {question.category} • {question.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                      <p className="text-sm text-white leading-relaxed">{question.text}</p>
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