'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Evaluation } from '@/types';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyChart } from './EmptyChart';
import { BarChart3 } from 'lucide-react';

interface ScoreDistributionChartProps {
  evaluations: Evaluation[];
}

export function ScoreDistributionChart({ evaluations }: ScoreDistributionChartProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [evaluations]);

  // Show loading state
  if (isLoading) {
    return <ChartSkeleton title="Score Distribution" description="Processing score distribution data..." />;
  }

  // Show empty state if no data
  if (evaluations.length === 0) {
    return (
      <EmptyChart 
        title="Score Distribution"
        description="No evaluation data available to show score distribution."
        icon={BarChart3}
      />
    );
  }

  const getScoreDistribution = () => {
    const ranges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ];

    return ranges.map(({ range, min, max }) => {
      const count = evaluations.filter(
        evaluation => evaluation.evaluation_results.combined_score >= min && 
                     evaluation.evaluation_results.combined_score <= max
      ).length;
      
      return { range, count };
    });
  };

  const data = getScoreDistribution();
  
  return (
    <Card className="col-span-2 bg-[--color-card] border border-[--color-border]">
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="range" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--chart-1))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}