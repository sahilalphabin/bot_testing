'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Evaluation, HeatmapDataPoint } from '@/types';

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
  
  const heatmapData = useMemo(() => {
    const data: HeatmapDataPoint[] = [];
    const groupKey = showDifficulty ? 'difficulty' : 'category';
    const groups = showDifficulty ? difficulties : categories;

    groups.forEach(group => {
      dimensions.forEach(dimension => {
        const filteredEvals = evaluations.filter(eval => 
          (showDifficulty ? eval.question.difficulty : eval.question.category) === group
        );

        if (filteredEvals.length === 0) return;

        const scores = filteredEvals
          .map(eval => {
            const details = eval.evaluation_results.ml_details || eval.evaluation_results.details;
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

  // Get value range for color scaling
  const minValue = Math.min(...heatmapData.map(d => d.value));
  const maxValue = Math.max(...heatmapData.map(d => d.value));

  const getColor = (value: number) => {
    if (maxValue === minValue) return 'bg-blue-300';
    
    const normalized = (value - minValue) / (maxValue - minValue);
    
    if (normalized < 0.3) return 'bg-red-200 text-red-900';
    if (normalized < 0.5) return 'bg-yellow-200 text-yellow-900';
    if (normalized < 0.7) return 'bg-blue-200 text-blue-900';
    if (normalized < 0.85) return 'bg-green-200 text-green-900';
    return 'bg-green-300 text-green-900';
  };

  const getIntensity = (value: number) => {
    if (maxValue === minValue) return 0.5;
    return (value - minValue) / (maxValue - minValue);
  };

  const groups = showDifficulty ? difficulties : categories;

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
                      <div key={group} className="p-2 bg-gray-100 dark:bg-gray-800 text-center text-sm">
                        N/A
                      </div>
                    );
                  }

                  return (
                    <div
                      key={group}
                      className={`p-2 text-center text-sm font-medium transition-colors ${getColor(dataPoint.value)}`}
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
            <div className="w-4 h-4 bg-red-200"></div>
            <div className="w-4 h-4 bg-yellow-200"></div>
            <div className="w-4 h-4 bg-blue-200"></div>
            <div className="w-4 h-4 bg-green-200"></div>
            <div className="w-4 h-4 bg-green-300"></div>
          </div>
          <span className="text-sm">High</span>
        </div>
      </CardContent>
    </Card>
  );
}