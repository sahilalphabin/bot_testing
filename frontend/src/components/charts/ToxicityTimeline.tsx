'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Evaluation } from '@/types';

interface ToxicityTimelineProps {
  evaluations: Evaluation[];
}

export function ToxicityTimeline({ evaluations }: ToxicityTimelineProps) {
  const data = evaluations.slice(-15).map((e, idx) => ({
    name: `#${evaluations.length - (evaluations.slice(-15).length - idx - 1)}`,
    ml: e.evaluation_results.ml_details?.toxicity ?? 0,
    ai: e.evaluation_results.gemini_details?.toxicity ?? 0,
  }));

  return (
    <Card className="col-span-2 bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white">Toxicity Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', color: 'hsl(var(--foreground))' }} />
            <Legend />
            <Line type="monotone" dataKey="ml" stroke="#ef4444" name="ML" strokeWidth={2} />
            <Line type="monotone" dataKey="ai" stroke="#f59e0b" name="AI" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

