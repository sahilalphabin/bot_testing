'use client';

import { Navigation } from "@/components/Navigation";
import { StatCard } from "@/components/StatCard";
import { ScoreDistributionChart } from "@/components/charts/ScoreDistributionChart";
import { EvaluatorComparisonChart } from "@/components/charts/EvaluatorComparisonChart";
import { RecentEvaluations } from "@/components/RecentEvaluations";
import { DemoDataButton } from "@/components/DemoDataButton";
import { useData } from "@/context/DataContext";
import { FileText, TrendingUp, CheckCircle, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const { evaluations, statistics } = useData();

  const weeklyEvaluations = evaluations.filter(evaluation => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(evaluation.timestamp) > weekAgo;
  }).length;

  return (
    <div className="min-h-screen bg-stone-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-stone-100">Dashboard</h1>
              <p className="mt-1 text-stone-400">
                Overview of chatbot evaluation results and performance metrics
              </p>
            </div>
            <DemoDataButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Evaluations"
            value={statistics.total_evaluations}
            description="All time evaluations"
            icon={FileText}
          />
          <StatCard
            title="Average Score"
            value={`${statistics.average_score}%`}
            description="Overall performance"
            icon={TrendingUp}
          />
          <StatCard
            title="Pass Rate"
            value={`${statistics.pass_rate}%`}
            description="Scores ≥ 70%"
            icon={CheckCircle}
          />
          <StatCard
            title="This Week"
            value={weeklyEvaluations}
            description="Recent evaluations"
            icon={BarChart3}
          />
        </div>

        {/* Charts and Recent Evaluations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <ScoreDistributionChart evaluations={evaluations} />
            <EvaluatorComparisonChart evaluations={evaluations} />
          </div>
          
          {/* Recent Evaluations */}
          <div className="lg:col-span-1">
            <RecentEvaluations evaluations={evaluations} />
          </div>
        </div>
      </div>
    </div>
  );
}
