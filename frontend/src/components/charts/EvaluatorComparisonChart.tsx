'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Evaluation } from '@/types';

interface EvaluatorComparisonChartProps {
  evaluations: Evaluation[];
}

export function EvaluatorComparisonChart({ evaluations }: EvaluatorComparisonChartProps) {
  const getComparisonData = () => {
    return evaluations.slice(-10).map((evaluation, index) => ({
      evaluation: `Eval ${index + 1}`,
      ml_score: evaluation.evaluation_results.ml_score,
      gemini_score: evaluation.evaluation_results.gemini_score,
      combined_score: evaluation.evaluation_results.combined_score
    }));
  };

  const data = getComparisonData().reverse();

  return (
    <Card className="col-span-2 bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white">ML vs AI Evaluator Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="evaluation" 
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
            <Legend />
            <Line 
              type="monotone" 
              dataKey="ml_score" 
              stroke="hsl(var(--foreground))" 
              name="ML Score"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="gemini_score" 
              stroke="hsl(var(--muted-foreground))" 
              name="Gemini Score"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="combined_score" 
              stroke="#6b7280" 
              name="Combined Score"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}