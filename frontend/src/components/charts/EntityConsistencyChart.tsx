'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Evaluation } from '@/types';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyChart } from './EmptyChart';
import { Users } from 'lucide-react';

interface EntityConsistencyChartProps {
  evaluations: Evaluation[];
  title?: string;
}

export function EntityConsistencyChart({ evaluations, title = "Entity Consistency Distribution" }: EntityConsistencyChartProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 550);

    return () => clearTimeout(timer);
  }, [evaluations]);

  // Show loading state
  if (isLoading) {
    return <ChartSkeleton title={title} description="Processing entity consistency data..." />;
  }

  // Process entity F1 scores into histogram bins
  const entityScores = evaluations
    .map(evaluation => evaluation.evaluation_results.ml_details?.entity_f1 || evaluation.evaluation_results.details.entity_f1)
    .filter(score => score !== undefined && !isNaN(score)) as number[];

  const bins = [
    { range: '0-20', min: 0, max: 20, count: 0, color: 'hsl(var(--chart-5))' },
    { range: '20-40', min: 20, max: 40, count: 0, color: 'hsl(var(--chart-4))' },
    { range: '40-60', min: 40, max: 60, count: 0, color: 'hsl(var(--chart-3))' },
    { range: '60-80', min: 60, max: 80, count: 0, color: 'hsl(var(--chart-2))' },
    { range: '80-100', min: 80, max: 100, count: 0, color: 'hsl(var(--chart-1))' },
  ];

  entityScores.forEach(score => {
    const bin = bins.find(b => score >= b.min && score < b.max) || bins[bins.length - 1];
    bin.count++;
  });

  // Calculate statistics
  const avgEntityF1 = entityScores.length > 0 
    ? entityScores.reduce((sum, score) => sum + score, 0) / entityScores.length
    : 0;

  const lowEntityF1Count = entityScores.filter(score => score < 50).length;
  const lowEntityF1Percentage = entityScores.length > 0 
    ? (lowEntityF1Count / entityScores.length) * 100
    : 0;

  // Show empty state if no entity data
  if (entityScores.length === 0) {
    return (
      <EmptyChart 
        title={title}
        description="No entity consistency data available. Entity analysis requires ML evaluation details."
        icon={Users}
      />
    );
  }

  // Get detailed missing entities info
  const missingEntitiesData = evaluations
    .filter(evaluation => {
      const missingCount = evaluation.evaluation_results.ml_metrics?.missing_entities_count || 0;
      return missingCount > 0;
    })
    .map(evaluation => ({
      id: evaluation.id,
      category: evaluation.question.category,
      missingCount: evaluation.evaluation_results.ml_metrics?.missing_entities_count || 0,
      entityF1: evaluation.evaluation_results.ml_details?.entity_f1 || evaluation.evaluation_results.details.entity_f1 || 0,
      missingEntities: evaluation.evaluation_results.trace?.ml?.missing_entities || []
    }))
    .sort((a, b) => b.missingCount - a.missingCount)
    .slice(0, 5); // Top 5 worst cases

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="p-3 rounded-lg shadow-sm" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
          <p className="font-semibold">Entity F1 Score: {label}</p>
          <p className="text-sm">
            <span className="text-foreground">Count:</span> {data.value}
          </p>
          <p className="text-sm">
            <span className="text-foreground">Percentage:</span> {
              entityScores.length > 0 ? ((data.value / entityScores.length) * 100).toFixed(1) : 0
            }%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Main histogram */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Distribution of entity F1 scores across all evaluations. Lower scores indicate more missing or mismatched entities.
            <div className="mt-2 flex gap-4 text-sm">
              <span>Average F1: <strong>{avgEntityF1.toFixed(1)}</strong></span>
              <span>Below 50: <strong>{lowEntityF1Count} ({lowEntityF1Percentage.toFixed(1)}%)</strong></span>
              <span>Total: <strong>{entityScores.length}</strong></span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bins}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15, stroke: 'transparent' }} content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} stroke="transparent">
                  {bins.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed missing entities table */}
      {missingEntitiesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Worst Entity Misses</CardTitle>
            <CardDescription>
              Evaluations with the highest number of missing entities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Evaluation</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Missing Count</th>
                    <th className="text-left p-2">Entity F1</th>
                    <th className="text-left p-2">Missing Entities</th>
                  </tr>
                </thead>
                <tbody>
                  {missingEntitiesData.map((item, index) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2 font-mono text-xs">
                        {item.id.slice(0, 8)}...
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary" className="capitalize">{item.category}</Badge>
                      </td>
                      <td className="p-2 font-semibold text-red-600">
                        {item.missingCount}
                      </td>
                      <td className="p-2">
                        <span className={`font-medium ${
                          item.entityF1 < 30 ? 'text-red-600' :
                          item.entityF1 < 60 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {item.entityF1.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs overflow-hidden">
                          {item.missingEntities.slice(0, 3).join(', ')}
                          {item.missingEntities.length > 3 && '...'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}