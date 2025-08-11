'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Evaluation } from '@/types';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyChart } from './EmptyChart';
import { GitCompare } from 'lucide-react';

interface EvaluatorComparisonChartProps {
  evaluations: Evaluation[];
}

export function EvaluatorComparisonChart({ evaluations }: EvaluatorComparisonChartProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [evaluations]);

  // Show loading state
  if (isLoading) {
    return <ChartSkeleton title="ML vs AI Evaluator Performance" description="Loading evaluator comparison data..." />;
  }

  // Show empty state if no data
  if (evaluations.length === 0) {
    return (
      <EmptyChart 
        title="ML vs AI Evaluator Performance"
        description="No evaluation data available to compare ML and AI evaluator performance."
        icon={GitCompare}
      />
    );
  }

  const getComparisonData = () => {
    return evaluations.slice(-10).map((evaluation, index) => ({
      evaluation: `Eval ${index + 1}`,
      ml_score: evaluation.evaluation_results.ml_score,
      gemini_score: evaluation.evaluation_results.gemini_score,
      combined_score: evaluation.evaluation_results.combined_score,
      timestamp: evaluation.timestamp
    }));
  };

  const data = getComparisonData().reverse();


  return (
    <Card className="col-span-2 bg-[--color-card] border border-[--color-border]">
      <CardHeader>
        <CardTitle>ML vs AI Evaluator Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="evaluation" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={({ x, y, payload }) => (
                <g>
                  <text
                    x={x}
                    y={y}
                    dy={16}
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={12}
                  >
                    {payload.value}
                  </text>
                  <text
                    x={x}
                    y={y + 28}
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize={10}
                  >
                    {data[payload.index]?.timestamp
                      ? new Date(data[payload.index].timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      : ''}
                  </text>
                </g>
              )}
              interval={0}
              height={50}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              cursor={{ stroke: 'transparent' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="ml_score" 
              stroke="hsl(var(--chart-1))" 
              name="ML Score"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="gemini_score" 
              stroke="hsl(var(--chart-2))" 
              name="AI Score"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="combined_score" 
              stroke="hsl(var(--chart-3))" 
              name="Combined Score"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}