'use client';

import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Evaluation, ScatterDataPoint } from '@/types';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyChart } from './EmptyChart';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReadabilityScoreChartProps {
  evaluations: Evaluation[];
  title?: string;
}

const categoryColors = {
  general: 'hsl(var(--chart-1))',
  safety: 'hsl(var(--chart-2))',
  technical: 'hsl(var(--chart-3))', 
  creative: 'hsl(var(--chart-4))'
};

export function ReadabilityScoreChart({ evaluations, title = "Readability vs Combined Score" }: ReadabilityScoreChartProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [evaluations]);

  // Show loading state
  if (isLoading) {
    return <ChartSkeleton title={title} description="Analyzing readability patterns..." />;
  }

  // Prepare scatter plot data
  const scatterData: ScatterDataPoint[] = evaluations
    .filter(evaluation => {
      const readability = evaluation.evaluation_results.ml_details?.readability || evaluation.evaluation_results.details.readability;
      const score = evaluation.evaluation_results.combined_score || 
                   evaluation.evaluation_results.ml_score || 
                   evaluation.evaluation_results.gemini_score;
      return readability !== undefined && score !== undefined;
    })
    .map((evaluation, index) => {
      const readability = evaluation.evaluation_results.ml_details?.readability || evaluation.evaluation_results.details.readability!;
      const score = evaluation.evaluation_results.combined_score || 
                   evaluation.evaluation_results.ml_score || 
                   evaluation.evaluation_results.gemini_score!;
      
      // Calculate answer length for bubble sizing
      const answerLength = evaluation.chatbot_answer.split(' ').length;
      
      return {
        x: readability,
        y: score,
        category: evaluation.question.category,
        difficulty: evaluation.question.difficulty,
        id: evaluation.id,
        name: `Evaluation ${index + 1}`,
        answerLength,
        grammarErrors: evaluation.evaluation_results.ml_metrics?.grammar_errors || 0,
        clarity: evaluation.evaluation_results.ml_details?.clarity || evaluation.evaluation_results.details.clarity || 0
      };
    });

  // Show empty state if no data
  if (scatterData.length === 0) {
    return (
      <EmptyChart 
        title={title}
        description="No readability data available. Readability analysis requires ML evaluation details."
        icon={FileText}
      />
    );
  }

  // Calculate correlation
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

  const correlation = calculateCorrelation(scatterData);

  // Calculate readability stats
  const avgReadability = scatterData.length > 0 
    ? scatterData.reduce((sum, point) => sum + point.x, 0) / scatterData.length
    : 0;

  const lowReadabilityCount = scatterData.filter(point => point.x < 30).length;
  const lowReadabilityPercentage = scatterData.length > 0 
    ? (lowReadabilityCount / scatterData.length) * 100 
    : 0;

  // Identify outliers (high score + low readability or vice versa)
  const outliers = scatterData.filter(point => 
    (point.x < 30 && point.y > 80) || // Low readability but high score
    (point.x > 80 && point.y < 40)    // High readability but low score
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 rounded-lg shadow-sm" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            <span className="text-foreground">Readability:</span> {data.x.toFixed(1)}
          </p>
          <p className="text-sm">
            <span className="text-foreground">Score:</span> {data.y.toFixed(1)}
          </p>
          <p className="text-sm">
            <span className="text-foreground">Clarity:</span> {data.clarity.toFixed(1)}
          </p>
          <p className="text-sm">
            <span className="text-foreground">Grammar Errors:</span> {data.grammarErrors}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Answer Length:</span> {data.answerLength} words
          </p>
          <p className="text-sm capitalize">
            <span className="text-muted-foreground">Category:</span> {data.category}
          </p>
          <p className="text-sm capitalize">
            <span className="text-muted-foreground">Difficulty:</span> {data.difficulty}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Main scatter chart */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Relationship between readability scores and overall evaluation performance. 
            Higher readability should generally correlate with better scores.
            <div className="mt-2 flex gap-4 text-sm">
              <span>Correlation: <strong>{correlation.toFixed(3)}</strong></span>
              <span>Avg Readability: <strong>{avgReadability.toFixed(1)}</strong></span>
              <span>Poor Readability (&lt;30): <strong>{lowReadabilityCount} ({lowReadabilityPercentage.toFixed(1)}%)</strong></span>
              <span>Data Points: <strong>{scatterData.length}</strong></span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Readability Score"
                  domain={[0, 100]}
                  label={{ value: 'Readability Score (Flesch)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Combined Score"
                  domain={[0, 100]}
                  label={{ value: 'Combined Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip cursor={{ stroke: 'transparent', fill: 'hsl(var(--muted))', opacity: 0.15 }} content={<CustomTooltip />} />
                
                {/* Reference lines */}
                <ReferenceLine 
                  x={30} 
                  stroke="#dc2626" 
                  strokeDasharray="5 5"
                  label={{ value: "Poor Readability", position: "topLeft" }}
                />
                <ReferenceLine 
                  x={60} 
                  stroke="#d97706" 
                  strokeDasharray="5 5"
                  label={{ value: "Average Readability", position: "topLeft" }}
                />
                <ReferenceLine 
                  y={70} 
                  stroke="#059669" 
                  strokeDasharray="5 5"
                  label={{ value: "Good Score", position: "topLeft" }}
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
        </CardContent>
      </Card>

      {/* Outliers table */}
      {outliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Readability-Score Outliers</CardTitle>
            <CardDescription>
              Cases where readability and score don't align as expected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Evaluation</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Readability</th>
                    <th className="text-left p-2">Score</th>
                    <th className="text-left p-2">Clarity</th>
                    <th className="text-left p-2">Grammar Errors</th>
                    <th className="text-left p-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {outliers.map((item) => {
                    const isHighScoreLowReadability = item.x < 30 && item.y > 80;
                    const type = isHighScoreLowReadability ? 'High Score + Low Readability' : 'High Readability + Low Score';
                    
                    return (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2 font-mono text-xs">
                          {(item.id as string).slice(0, 8)}...
                        </td>
                        <td className="p-2">
                          <Badge variant="secondary" className="capitalize">{item.category}</Badge>
                        </td>
                        <td className="p-2">
                          <span className={`font-medium ${
                            item.x < 30 ? 'text-red-600' :
                            item.x < 60 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {item.x.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`font-medium ${
                            item.y < 40 ? 'text-red-600' :
                            item.y < 70 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {item.y.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-2">
                          {(item as any).clarity.toFixed(1)}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`${
                            ((item as any).grammarErrors as number) > 3 ? 'text-red-600 font-medium' : 'text-gray-600'
                          }`}>
                            {(item as any).grammarErrors}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            isHighScoreLowReadability ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {type}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}