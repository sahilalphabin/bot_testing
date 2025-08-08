'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Evaluation } from '@/types';

interface ScoreDistributionChartProps {
  evaluations: Evaluation[];
}

export function ScoreDistributionChart({ evaluations }: ScoreDistributionChartProps) {
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
    <Card className="col-span-2 bg-stone-800 border-stone-700">
      <CardHeader>
        <CardTitle className="text-stone-100">Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="#57534e" />
            <XAxis 
              dataKey="range" 
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
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}