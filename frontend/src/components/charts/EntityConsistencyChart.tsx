'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Evaluation } from '@/types';

interface EntityConsistencyChartProps {
  evaluations: Evaluation[];
  title?: string;
}

export function EntityConsistencyChart({ evaluations, title = "Entity Consistency Distribution" }: EntityConsistencyChartProps) {
  // Process entity F1 scores into histogram bins
  const entityScores = evaluations
    .map(eval => eval.evaluation_results.ml_details?.entity_f1 || eval.evaluation_results.details.entity_f1)
    .filter(score => score !== undefined && !isNaN(score)) as number[];

  const bins = [
    { range: '0-20', min: 0, max: 20, count: 0, color: '#dc2626' },
    { range: '20-40', min: 20, max: 40, count: 0, color: '#ea580c' },
    { range: '40-60', min: 40, max: 60, count: 0, color: '#d97706' },
    { range: '60-80', min: 60, max: 80, count: 0, color: '#65a30d' },
    { range: '80-100', min: 80, max: 100, count: 0, color: '#16a34a' },
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

  // Get detailed missing entities info
  const missingEntitiesData = evaluations
    .filter(eval => {
      const missingCount = eval.evaluation_results.ml_metrics?.missing_entities_count || 0;
      return missingCount > 0;
    })
    .map(eval => ({
      id: eval.id,
      category: eval.question.category,
      missingCount: eval.evaluation_results.ml_metrics?.missing_entities_count || 0,
      entityF1: eval.evaluation_results.ml_details?.entity_f1 || eval.evaluation_results.details.entity_f1 || 0,
      missingEntities: eval.evaluation_results.trace?.ml?.missing_entities || []
    }))
    .sort((a, b) => b.missingCount - a.missingCount)
    .slice(0, 5); // Top 5 worst cases

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <p className="font-semibold">Entity F1 Score: {label}</p>
          <p className="text-sm">
            <span className="text-blue-600">Count:</span> {data.value}
          </p>
          <p className="text-sm">
            <span className="text-green-600">Percentage:</span> {
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
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
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.category === 'safety' ? 'bg-red-100 text-red-800' :
                          item.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                          item.category === 'creative' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.category}
                        </span>
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