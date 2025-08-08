'use client';

import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Evaluation, ScatterDataPoint } from '@/types';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyChart } from './EmptyChart';
import { ChartSettings, type ChartConfiguration } from './ChartSettings';
import { TrendingUp } from 'lucide-react';

interface AgreementScatterChartProps {
  evaluations: Evaluation[];
  title?: string;
}

const categoryColors = {
  general: '#8884d8',
  safety: '#dc2626',
  technical: '#059669', 
  creative: '#7c3aed'
};

export function AgreementScatterChart({ evaluations, title = "ML vs AI Score Agreement" }: AgreementScatterChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [chartConfig, setChartConfig] = useState<ChartConfiguration>({
    showLegend: true,
    showGrid: true,
    showTooltips: true,
    maxDataPoints: 100,
    groupByCategory: true,
    showTrendLine: false,
    colorScheme: 'default',
    chartHeight: 'medium',
    hideEmptyCategories: false,
    minThreshold: 0
  });

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [evaluations]);

  // Show loading state
  if (isLoading) {
    return <ChartSkeleton title={title} description="Loading ML vs AI score comparison data..." />;
  }

  // Prepare scatter plot data with configuration filters
  const scatterData: ScatterDataPoint[] = evaluations
    .filter(evaluation => 
      evaluation.evaluation_results.ml_score !== undefined && 
      evaluation.evaluation_results.gemini_score !== undefined
    )
    .filter(evaluation => {
      const score = evaluation.evaluation_results.combined_score || evaluation.evaluation_results.ml_score || 0;
      return score >= chartConfig.minThreshold;
    })
    .slice(0, chartConfig.maxDataPoints)
    .map((evaluation, index) => ({
      x: evaluation.evaluation_results.ml_score!,
      y: evaluation.evaluation_results.gemini_score!,
      category: evaluation.question.category,
      difficulty: evaluation.question.difficulty,
      id: evaluation.id,
      name: `Evaluation ${index + 1}`,
      combined: evaluation.evaluation_results.combined_score
    }));

  // Calculate correlation coefficient
  const calculateCorrelation = (data: ScatterDataPoint[]) => {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.x, 0);
    const sumY = data.reduce((sum, point) => sum + point.y, 0);
    const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumX2 = data.reduce((sum, point) => sum + point.x * point.x, 0);
    const sumY2 = data.reduce((sum, point) => sum + point.y * point.y, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Show empty state if no data
  if (scatterData.length === 0) {
    return (
      <EmptyChart 
        title={title}
        description="No evaluations found with both ML and AI scores"
        icon={TrendingUp}
        actionLabel="View All Data"
      />
    );
  }

  const correlation = calculateCorrelation(scatterData);

  // Calculate mean absolute error (disagreement)
  const mae = scatterData.length > 0 
    ? scatterData.reduce((sum, point) => sum + Math.abs(point.x - point.y), 0) / scatterData.length
    : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            <span className="text-blue-600">ML Score:</span> {data.x.toFixed(1)}
          </p>
          <p className="text-sm">
            <span className="text-green-600">AI Score:</span> {data.y.toFixed(1)}
          </p>
          <p className="text-sm">
            <span className="text-purple-600">Difference:</span> {Math.abs(data.x - data.y).toFixed(1)}
          </p>
          <p className="text-sm capitalize">
            <span className="text-gray-600">Category:</span> {data.category}
          </p>
          <p className="text-sm capitalize">
            <span className="text-gray-600">Difficulty:</span> {data.difficulty}
          </p>
        </div>
      );
    }
    return null;
  };

  const getHeightClass = () => {
    switch (chartConfig.chartHeight) {
      case 'small': return 'h-64';
      case 'large': return 'h-[600px]';
      default: return 'h-96';
    }
  };

  const handleExport = () => {
    // Export chart as PNG (implementation would go here)
    console.log('Exporting chart...');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="space-y-4">
      <ChartSettings
        title={title}
        settings={chartConfig}
        onSettingsChange={setChartConfig}
        onExport={handleExport}
        onRefresh={handleRefresh}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Comparison of ML and Gemini evaluation scores. Points closer to the diagonal line indicate better agreement.
            <div className="mt-2 flex gap-4 text-sm">
              <span>Correlation: <strong>{correlation.toFixed(3)}</strong></span>
              <span>Mean Disagreement: <strong>{mae.toFixed(1)}</strong></span>
              <span>Data Points: <strong>{scatterData.length}</strong></span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={getHeightClass()}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="ML Score"
                  domain={[0, 100]}
                  label={{ value: 'ML Score', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="AI Score"
                  domain={[0, 100]}
                  label={{ value: 'AI Score', angle: -90, position: 'insideLeft' }}
                />
                {chartConfig.showTooltips && <Tooltip content={<CustomTooltip />} />}
              
              {/* Perfect agreement line (y=x) */}
              <ReferenceLine 
                segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{ value: "Perfect Agreement", position: "top" }}
              />
              
              {/* Scatter plot by category */}
              {Object.entries(categoryColors).map(([category, color]) => {
                const categoryData = scatterData.filter(point => point.category === category);
                if (categoryData.length === 0) return null;
                
                return (
                  <Scatter
                    key={category}
                    name={category.charAt(0).toUpperCase() + category.slice(1)}
                    data={categoryData}
                    fill={color}
                  />
                );
              })}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
            {/* Legend */}
            {chartConfig.showLegend && (
              <div className="mt-4 flex flex-wrap gap-4 justify-center">
                {Object.entries(categoryColors).map(([category, color]) => {
                  const count = scatterData.filter(point => point.category === category).length;
                  if (count === 0) return null;
                  
                  return (
                    <div key={category} className="flex items-center gap-2 text-sm">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="capitalize">{category} ({count})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
}