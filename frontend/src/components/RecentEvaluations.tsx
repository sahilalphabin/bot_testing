'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Evaluation } from '@/types';
import Link from 'next/link';

interface RecentEvaluationsProps {
  evaluations: Evaluation[];
}

function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  if (score >= 40) return "outline";
  return "destructive";
}

export function RecentEvaluations({ evaluations }: RecentEvaluationsProps) {
  const recentEvaluations = evaluations.slice(0, 5);

  return (
    <Card className="bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white">Recent Evaluations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentEvaluations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No evaluations yet. <Link href="/evaluate" className="text-white hover:underline">Create your first evaluation</Link>
            </p>
          ) : (
            recentEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-600 bg-gray-700">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-white">
                    {evaluation.question.text}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs border-gray-500 text-gray-300">
                      {evaluation.question.category}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(evaluation.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getScoreBadgeVariant(evaluation.evaluation_results.combined_score)} className="text-xs">
                    {evaluation.evaluation_results.combined_score.toFixed(1)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}