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

  const data = getComparisonData();

  return (
    <Card className="col-span-2 bg-stone-800 border-stone-700">
      <CardHeader>
        <CardTitle className="text-stone-100">ML vs Gemini Evaluator Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="#57534e" />
            <XAxis 
              dataKey="evaluation" 
              stroke="#a8a29e"
              fontSize={12}
            />
            <YAxis 
              stroke="#a8a29e"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#292524',
                border: '1px solid #57534e',
                borderRadius: '6px',
                color: '#f5f5f4'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="ml_score" 
              stroke="#3b82f6" 
              name="ML Score"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="gemini_score" 
              stroke="#10b981" 
              name="Gemini Score"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="combined_score" 
              stroke="#f59e0b" 
              name="Combined Score"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}