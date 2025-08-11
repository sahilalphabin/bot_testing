'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Evaluation, HeatmapDataPoint } from '@/types';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyChart } from './EmptyChart';
import { Grid } from 'lucide-react';

interface CategoryDimensionHeatmapProps {
  evaluations: Evaluation[];
  title?: string;
  showDifficulty?: boolean;
}

const dimensions = [
  { key: 'similarity', label: 'Similarity' },
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'completeness', label: 'Completeness' },
  { key: 'relevance', label: 'Relevance' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'readability', label: 'Readability' },
  { key: 'factual_consistency', label: 'Factual' },
  { key: 'entity_f1', label: 'Entity F1' },
  { key: 'refusal_compliance', label: 'Safety Compliance' },
  { key: 'numeric_consistency', label: 'Numeric' }
];

const categories = ['general', 'safety', 'technical', 'creative'];
const difficulties = ['easy', 'medium', 'hard'];

export function CategoryDimensionHeatmap({ 
  evaluations, 
  title = "Performance by Category & Dimension", 
  showDifficulty = false 
}: CategoryDimensionHeatmapProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [evaluations, showDifficulty]);

  // Compute heatmap data unconditionally to keep hook order stable
  const heatmapData = useMemo(() => {
    const data: HeatmapDataPoint[] = [];
    const groups = showDifficulty ? difficulties : categories;

    groups.forEach(group => {
      dimensions.forEach(dimension => {
        const filteredEvals = evaluations.filter(evaluation => 
          (showDifficulty ? evaluation.question.difficulty : evaluation.question.category) === group
        );

        if (filteredEvals.length === 0) return;

        const scores = filteredEvals
          .map(evaluation => {
            const details = evaluation.evaluation_results.ml_details || evaluation.evaluation_results.details;
            return (details as any)?.[dimension.key];
          })
          .filter(score => score !== undefined && !isNaN(score));

        if (scores.length === 0) return;

        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        data.push({
          category: group,
          dimension: dimension.label,
          value: avgScore,
          count: scores.length
        });
      });
    });

    return data;
  }, [evaluations, showDifficulty]);

  // Show loading state
  if (isLoading) {
    return (
      <ChartSkeleton 
        title={title} 
        description={`Loading performance heatmap by ${showDifficulty ? 'difficulty' : 'category'}...`}
        height="h-80"
      />
    );
  }
  
  // Get value range for color scaling
  const minValue = Math.min(...heatmapData.map(d => d.value));
  const maxValue = Math.max(...heatmapData.map(d => d.value));

  const getColorClass = (value: number) => {
    if (maxValue === minValue) return 'bg-[hsl(var(--chart-3))]';
    const normalized = (value - minValue) / (maxValue - minValue);
    // Map low values to warm colors -> high values to cool/green/blue for pleasant contrast
    if (normalized < 0.2) return 'bg-[hsl(var(--chart-5))] text-white';      // red
    if (normalized < 0.4) return 'bg-[hsl(var(--chart-3))] text-white';      // orange
    if (normalized < 0.6) return 'bg-[hsl(var(--chart-4))] text-white';      // purple
    if (normalized < 0.8) return 'bg-[hsl(var(--chart-2))] text-black';      // green
    return 'bg-[hsl(var(--chart-1))] text-black';                            // blue
  };

  const getIntensity = (value: number) => {
    if (maxValue === minValue) return 0.5;
    return (value - minValue) / (maxValue - minValue);
  };

  const groups = showDifficulty ? difficulties : categories;

  // Show empty state if no data
  if (heatmapData.length === 0) {
    return (
      <EmptyChart 
        title={title}
        description={`No data available for ${showDifficulty ? 'difficulty' : 'category'} performance analysis`}
        icon={Grid}
        height="h-80"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Average dimension scores by {showDifficulty ? 'difficulty' : 'category'}. 
          Darker cells indicate higher scores.
          <div className="mt-2 text-sm">
            <span>Range: {minValue.toFixed(1)} - {maxValue.toFixed(1)}</span>
            <span className="ml-4">Total Evaluations: {evaluations.length}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 gap-4 min-w-max">
            {/* Header */}
            <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${groups.length}, 100px)` }}>
              <div className="p-2 font-semibold text-sm">Dimension</div>
              {groups.map(group => (
                <div key={group} className="p-2 font-semibold text-center text-sm capitalize">
                  {group}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {dimensions.map(dimension => (
              <div key={dimension.key} className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${groups.length}, 100px)` }}>
                <div className="p-2 text-sm font-medium">
                  {dimension.label}
                </div>
                {groups.map(group => {
                  const dataPoint = heatmapData.find(d => 
                    d.category === group && d.dimension === dimension.label
                  );
                  
                  if (!dataPoint) {
                    return (
                      <div
                        key={group}
                        className="p-2 text-center text-sm rounded-md border border-[--color-border]/30 bg-[--color-muted] text-[--color-muted-foreground]"
                        title={`${dimension.label} for ${group}: N/A`}
                      >
                        N/A
                      </div>
                    );
                  }

                  const colorClass = getColorClass(dataPoint.value);
                  return (
                    <div
                      key={group}
                      className={`p-2 text-center text-sm font-medium ${colorClass} rounded-md border border-[--color-border]/30 hover:ring-1 hover:ring-[--color-border] transition-colors`}
                      title={`${dimension.label} for ${group}: ${dataPoint.value.toFixed(1)} (${dataPoint.count} evaluations)`}
                    >
                      <div>{dataPoint.value.toFixed(1)}</div>
                      <div className="text-xs opacity-75">({dataPoint.count})</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Color legend */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-sm">Low</span>
          <div className="flex">
            <div className="w-4 h-4 bg-[hsl(var(--chart-5))]"></div>
            <div className="w-4 h-4 bg-[hsl(var(--chart-3))]"></div>
            <div className="w-4 h-4 bg-[hsl(var(--chart-4))]"></div>
            <div className="w-4 h-4 bg-[hsl(var(--chart-2))]"></div>
            <div className="w-4 h-4 bg-[hsl(var(--chart-1))]"></div>
          </div>
          <span className="text-sm">High</span>
        </div>
      </CardContent>
    </Card>
  );
}