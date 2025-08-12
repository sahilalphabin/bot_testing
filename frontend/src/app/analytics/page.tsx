'use client';

import { useState, Suspense } from 'react';
import { useQueryState } from 'nuqs';
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
import { FileText, TrendingUp, CheckCircle, BarChart3, AlertTriangle, Target, GitCompare, Shield, Users, Grid, Activity, PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Evaluation } from '@/types';

export default function AnalyticsDashboard() {
  const { evaluations, statistics } = useData();
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>(evaluations);
  const [activeTab, setActiveTab] = useQueryState('tab', { defaultValue: 'overview' });

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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading analytics...</div>}>
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

          {/* Tabbed Analytics */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-none lg:inline-flex">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="agreement" className="flex items-center gap-2">
                  <GitCompare className="h-4 w-4" />
                  <span className="hidden sm:inline">Agreement</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  <span className="hidden sm:inline">Performance</span>
                </TabsTrigger>
                <TabsTrigger value="quality" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Quality</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
                <TabsTrigger value="dataset" className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  <span className="hidden sm:inline">Dataset</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <AgreementScatterChart evaluations={filteredEvaluations} />
                  <CategoryDimensionHeatmap 
                    evaluations={filteredEvaluations}
                    title="Performance by Category & Dimension"
                    showDifficulty={false}
                  />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <ScoreDistributionChart evaluations={filteredEvaluations} />
                  <SafetyComplianceChart evaluations={filteredEvaluations} />
                </div>
              </TabsContent>

              {/* Agreement & Calibration Tab */}
              <TabsContent value="agreement" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Agreement & Calibration</h3>
                  <p className="text-muted-foreground">Analyze consistency between ML and AI evaluators</p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <AgreementScatterChart evaluations={filteredEvaluations} />
                  <EvaluatorComparisonChart evaluations={filteredEvaluations} />
                </div>
              </TabsContent>

              {/* Performance Patterns Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Performance Patterns</h3>
                  <p className="text-muted-foreground">Explore performance across categories and difficulty levels</p>
                </div>
                <div className="space-y-6">
                  <CategoryDimensionHeatmap 
                    evaluations={filteredEvaluations}
                    title="Performance by Category & Dimension"
                    showDifficulty={false}
                  />
                  <CategoryDimensionHeatmap 
                    evaluations={filteredEvaluations} 
                    title="Performance by Difficulty Level & Dimension"
                    showDifficulty={true}
                  />
                </div>
              </TabsContent>

              {/* Quality & Safety Tab */}
              <TabsContent value="quality" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Quality & Safety Analysis</h3>
                  <p className="text-muted-foreground">Monitor entity consistency, safety compliance, and content quality</p>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <SafetyComplianceChart evaluations={filteredEvaluations} />
                  <EntityConsistencyChart evaluations={filteredEvaluations} />
                </div>
              </TabsContent>

              {/* Content Analysis Tab */}
              <TabsContent value="content" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Content Analysis</h3>
                  <p className="text-muted-foreground">Examine readability patterns and score distributions</p>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <ReadabilityScoreChart evaluations={filteredEvaluations} />
                  <ScoreDistributionChart evaluations={filteredEvaluations} />
                </div>
              </TabsContent>

              {/* Dataset Overview Tab */}
              <TabsContent value="dataset" className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Dataset Overview</h3>
                  <p className="text-muted-foreground">Dataset summary and recent evaluation activity</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Dataset Analysis</CardTitle>
                        <CardDescription>
                          Detailed breakdown of the current filtered dataset
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Data Quality</p>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Total Evaluations</span>
                                  <Badge variant="outline">{filteredEvaluations.length}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Unique Categories</span>
                                  <Badge variant="outline">{new Set(filteredEvaluations.map(e => e.question.category)).size}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Avg Processing Time</span>
                                  <Badge variant="outline">
                                    {filteredEvaluations.length > 0 ? 
                                      (filteredEvaluations.reduce((sum, e) => sum + (e.evaluation_results.processing_time || 0), 0) / filteredEvaluations.length).toFixed(1) 
                                      : '0.0'}s
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <p className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Evaluation Methods</p>
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">ML Only</span>
                                  <Badge variant="outline">
                                    {filteredEvaluations.filter(e => e.evaluation_results.ml_score !== undefined && e.evaluation_results.gemini_score === undefined).length}
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">AI Only</span>
                                  <Badge variant="outline">
                                    {filteredEvaluations.filter(e => e.evaluation_results.gemini_score !== undefined && e.evaluation_results.ml_score === undefined).length}
                                  </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm">Both Methods</span>
                                  <Badge variant="outline">
                                    {filteredEvaluations.filter(e => 
                                      e.evaluation_results.ml_score !== undefined && 
                                      e.evaluation_results.gemini_score !== undefined
                                    ).length}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <p className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Categories</p>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {['general', 'safety', 'technical', 'creative'].map(cat => {
                                  const count = filteredEvaluations.filter(e => e.question.category === cat).length;
                                  if (count === 0) return null;
                                  return (
                                    <div key={cat} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                      <span className="text-sm capitalize font-medium">{cat}</span>
                                      <Badge variant="secondary">{count}</Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <div>
                              <p className="font-medium text-sm uppercase tracking-wide text-muted-foreground">Difficulties</p>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {['easy', 'medium', 'hard'].map(diff => {
                                  const count = filteredEvaluations.filter(e => e.question.difficulty === diff).length;
                                  if (count === 0) return null;
                                  return (
                                    <div key={diff} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                      <span className="text-sm capitalize font-medium">{diff}</span>
                                      <Badge variant="secondary">{count}</Badge>
                                    </div>
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Suspense>
  );
}