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
    <Card className="col-span-2 bg-[--color-card] border border-[--color-border]">
      <CardHeader>
        <CardTitle>Method Scores (ML vs AI)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="method" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15, stroke: 'transparent' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', color: 'hsl(var(--foreground))' }} />
            <Legend />
            <Bar dataKey="ML" fill="hsl(var(--chart-2))" stroke="transparent" />
            <Bar dataKey="AI" fill="hsl(var(--chart-3))" stroke="transparent" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

