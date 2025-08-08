'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MethodBreakdownBarProps {
  ml?: Record<string, number>;
  ai?: Record<string, number>;
}

export function MethodBreakdownBar({ ml, ai }: MethodBreakdownBarProps) {
  const keys = Array.from(new Set([...(ml ? Object.keys(ml) : []), ...(ai ? Object.keys(ai) : [])]));
  const data = keys.map((k) => ({ method: k.toUpperCase(), ML: ml?.[k] ?? 0, AI: ai?.[k] ?? 0 }));

  return (
    <Card className="col-span-2 bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white">Method Scores (ML vs AI)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" stroke="hsl(var(--border))" />
            <XAxis dataKey="method" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px', color: 'hsl(var(--foreground))' }} />
            <Legend />
            <Bar dataKey="ML" fill="#60a5fa" />
            <Bar dataKey="AI" fill="#34d399" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

