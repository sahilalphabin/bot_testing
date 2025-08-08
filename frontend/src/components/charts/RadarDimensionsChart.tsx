'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RadarDimensionsChartProps {
  ml?: Record<string, number>;
  ai?: Record<string, number>;
  combined?: Record<string, number>;
}

function buildData(ml?: Record<string, number>, ai?: Record<string, number>, combined?: Record<string, number>) {
  const dims = [
    'similarity','accuracy','completeness','relevance','clarity','readability','sentiment','intent_match','factual_consistency','toxicity','bias'
  ];
  return dims.map((d) => ({
    metric: d.replace(/_/g, ' '),
    ml: ml?.[d] ?? 0,
    ai: ai?.[d] ?? 0,
    combined: combined?.[d] ?? 0,
  }));
}

export function RadarDimensionsChart({ ml, ai, combined }: RadarDimensionsChartProps) {
  const data = buildData(ml, ai, combined);
  return (
    <Card className="col-span-2 bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white">Dimension Radar (ML vs AI vs Combined)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />
            <Legend />
            <Radar name="ML" dataKey="ml" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} />
            <Radar name="AI" dataKey="ai" stroke="#34d399" fill="#34d399" fillOpacity={0.2} />
            <Radar name="Combined" dataKey="combined" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

