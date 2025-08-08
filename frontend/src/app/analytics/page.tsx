'use client';

import { useState, Suspense } from 'react';
import { StatCard } from "@/components/StatCard";
import { RecentEvaluations } from "@/components/RecentEvaluations";
import { DemoDataButton } from "@/components/DemoDataButton";
import { GlobalFilters } from "@/components/GlobalFilters";
import { InsightCards } from "@/components/InsightCards";

// Import all the new chart components
import { AgreementScatterChart } from "@/components/charts/AgreementScatterChart";
import { CategoryDimensionHeatmap } from "@/components/charts/CategoryDimensionHeatmap";
import { EntityConsistencyChart } from "@/components/charts/EntityConsistencyChart";
import { ReadabilityScoreChart } from "@/components/charts/ReadabilityScoreChart";
import { SafetyComplianceChart } from "@/components/charts/SafetyComplianceChart";

// Import existing charts
import { ScoreDistributionChart } from "@/components/charts/ScoreDistributionChart";
import { EvaluatorComparisonChart } from "@/components/charts/EvaluatorComparisonChart";

import { useData } from "@/context/DataContext";
import { exportToCSV, getTimestampedFilename } from "@/utils/exportUtils";
import { FileText, TrendingUp, CheckCircle, BarChart3, Eye, AlertTriangle, Target, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Evaluation } from '@/types';

export default function AnalyticsDashboard() {
  const { evaluations, statistics } = useData();
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>(evaluations);

  // Enhanced statistics for filtered data
  const getFilteredStats = () => {
    if (filteredEvaluations.length === 0) return { ...statistics, weeklyEvaluations: 0 };

    const scores = filteredEvaluations
      .map(evaluation => evaluation.evaluation_results.combined_score || evaluation.evaluation_results.ml_score || evaluation.evaluation_results.gemini_score || 0);
    
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const passRate = (scores.filter(score => score >= 70).length / scores.length) * 100;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyEvaluations = filteredEvaluations.filter(evaluation => 
      new Date(evaluation.timestamp) > weekAgo
    ).length;

    // Enhanced metrics
    const safetyEvaluations = filteredEvaluations.filter(evaluation => evaluation.question.category === 'safety').length;
    const entityF1Scores = filteredEvaluations
      .map(evaluation => evaluation.evaluation_results.ml_details?.entity_f1 || evaluation.evaluation_results.details.entity_f1)
      .filter(score => score !== undefined) as number[];
    const avgEntityF1 = entityF1Scores.length > 0 
      ? entityF1Scores.reduce((sum, score) => sum + score, 0) / entityF1Scores.length 
      : 0;

    return {
      total_evaluations: filteredEvaluations.length,
      average_score: Math.round(avgScore),
      pass_rate: Math.round(passRate),
      weeklyEvaluations,
      safetyEvaluations,
      avgEntityF1: Math.round(avgEntityF1)
    };
  };

  const filteredStats = getFilteredStats();

  const handleExportCSV = () => {
    const filename = getTimestampedFilename('chatbot-evaluations');
    exportToCSV(filteredEvaluations, filename);
  };

  return (
    <Suspense fallback={<div>Loading analytics...</div>}>
      <div className="min-h-screen bg-[--color-background] text-[--color-foreground]">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">Advanced Analytics</h1>
                <p className="mt-1 text-[--color-muted-foreground]">
                  Comprehensive insights and analysis of chatbot evaluation performance
                </p>
              </div>
              <div className="flex gap-2">
                <DemoDataButton />
              </div>
            </div>
          </div>

          {/* Global Filters */}
          <GlobalFilters 
            evaluations={evaluations}
            onFilterChange={setFilteredEvaluations}
            onExport={handleExportCSV}
          />

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <StatCard
              title="Total Evaluations"
              value={filteredStats.total_evaluations}
              description="Filtered evaluations"
              icon={FileText}
            />
            <StatCard
              title="Average Score"
              value={`${filteredStats.average_score}%`}
              description="Combined performance"
              icon={TrendingUp}
            />
            <StatCard
              title="Pass Rate"
              value={`${filteredStats.pass_rate}%`}
              description="Scores ≥ 70%"
              icon={CheckCircle}
            />
            <StatCard
              title="This Week"
              value={filteredStats.weeklyEvaluations}
              description="Recent activity"
              icon={BarChart3}
            />
            <StatCard
              title="Safety Questions"
              value={filteredStats.safetyEvaluations || 0}
              description="Safety category"
              icon={AlertTriangle}
            />
            <StatCard
              title="Entity Agreement"
              value={`${filteredStats.avgEntityF1}%`}
              description="Avg entity F1"
              icon={Target}
            />
          </div>

          {/* Key Insights */}
          <div className="mb-8">
            <InsightCards evaluations={filteredEvaluations} />
          </div>

          {/* Main Analytics Charts Grid */}
          <div className="space-y-8">
            
            {/* Top Priority Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AgreementScatterChart evaluations={filteredEvaluations} />
              <CategoryDimensionHeatmap evaluations={filteredEvaluations} />
            </div>

            {/* Entity and Safety Analysis */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <EntityConsistencyChart evaluations={filteredEvaluations} />
              <SafetyComplianceChart evaluations={filteredEvaluations} />
            </div>

            {/* Readability and Distribution */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ReadabilityScoreChart evaluations={filteredEvaluations} />
              <ScoreDistributionChart evaluations={filteredEvaluations} />
            </div>

            {/* Additional Analysis */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <EvaluatorComparisonChart evaluations={filteredEvaluations} />
              <CategoryDimensionHeatmap 
                evaluations={filteredEvaluations} 
                title="Performance by Difficulty & Dimension"
                showDifficulty={true}
              />
            </div>

            {/* Detailed Data View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Summary</CardTitle>
                    <CardDescription>
                      Key findings from the current data set
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Data Quality</p>
                          <p className="text-muted-foreground">
                            {filteredEvaluations.length} evaluations analyzed across {' '}
                            {new Set(filteredEvaluations.map(e => e.question.category)).size} categories
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Evaluation Methods</p>
                          <p className="text-muted-foreground">
                            ML: {filteredEvaluations.filter(e => e.evaluation_results.ml_score !== undefined).length}, {' '}
                            Gemini: {filteredEvaluations.filter(e => e.evaluation_results.gemini_score !== undefined).length}, {' '}
                            Both: {filteredEvaluations.filter(e => 
                              e.evaluation_results.ml_score !== undefined && 
                              e.evaluation_results.gemini_score !== undefined
                            ).length}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Categories</p>
                          <div className="flex gap-1 mt-1">
                            {['general', 'safety', 'technical', 'creative'].map(cat => {
                              const count = filteredEvaluations.filter(e => e.question.category === cat).length;
                              if (count === 0) return null;
                              return (
                                <Badge key={cat} variant="outline" className="text-xs">
                                  {cat}: {count}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">Difficulties</p>
                          <div className="flex gap-1 mt-1">
                            {['easy', 'medium', 'hard'].map(diff => {
                              const count = filteredEvaluations.filter(e => e.question.difficulty === diff).length;
                              if (count === 0) return null;
                              return (
                                <Badge key={diff} variant="outline" className="text-xs">
                                  {diff}: {count}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <RecentEvaluations evaluations={filteredEvaluations} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </Suspense>
  );
}