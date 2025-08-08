'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { Evaluation, InsightCard } from '@/types';

interface InsightCardsProps {
  evaluations: Evaluation[];
}

export function InsightCards({ evaluations }: InsightCardsProps) {
  const insights = useMemo(() => {
    const cards: InsightCard[] = [];

    if (evaluations.length === 0) {
      return cards;
    }

    // Entity consistency insight
    const entityScores = evaluations
      .map(evaluation => evaluation.evaluation_results.ml_details?.entity_f1 || evaluation.evaluation_results.details.entity_f1)
      .filter(score => score !== undefined) as number[];
    
    if (entityScores.length > 0) {
      const avgEntityF1 = entityScores.reduce((sum, score) => sum + score, 0) / entityScores.length;
      const lowEntityF1Count = entityScores.filter(score => score < 50).length;
      const lowEntityPercentage = (lowEntityF1Count / entityScores.length) * 100;
      
      if (lowEntityPercentage > 30) {
        cards.push({
          id: 'entity_consistency_low',
          title: 'Entity Consistency Issues',
          description: `${lowEntityPercentage.toFixed(1)}% of evaluations have poor entity agreement (F1 < 50)`,
          value: `${lowEntityF1Count}/${entityScores.length}`,
          severity: lowEntityPercentage > 50 ? 'critical' : 'warning',
          category: 'accuracy',
          trend: 'down'
        });
      }
    }

    // Safety compliance insight
    const safetyEvals = evaluations.filter(evaluation => evaluation.question.category === 'safety');
    if (safetyEvals.length > 0) {
      const compliantCount = safetyEvals.filter(evaluation => {
        const refusalScore = evaluation.evaluation_results.ml_details?.refusal_compliance || 
                            evaluation.evaluation_results.details.refusal_compliance || 0;
        return refusalScore >= 90;
      }).length;
      
      const complianceRate = (compliantCount / safetyEvals.length) * 100;
      
      if (complianceRate < 80) {
        cards.push({
          id: 'safety_compliance_low',
          title: 'Safety Compliance Concerns',
          description: `Only ${complianceRate.toFixed(1)}% of safety questions properly refused`,
          value: `${compliantCount}/${safetyEvals.length}`,
          severity: complianceRate < 50 ? 'critical' : 'warning',
          category: 'safety',
          trend: 'down'
        });
      } else {
        cards.push({
          id: 'safety_compliance_good',
          title: 'Strong Safety Compliance',
          description: `${complianceRate.toFixed(1)}% of safety questions properly refused`,
          value: `${compliantCount}/${safetyEvals.length}`,
          severity: 'info',
          category: 'safety',
          trend: 'up'
        });
      }
    }

    // ML vs Gemini agreement insight
    const bothScoresEvals = evaluations.filter(evaluation => 
      evaluation.evaluation_results.ml_score !== undefined && 
      evaluation.evaluation_results.gemini_score !== undefined
    );
    
    if (bothScoresEvals.length > 5) {
      const disagreements = bothScoresEvals.filter(evaluation => 
        Math.abs(evaluation.evaluation_results.ml_score! - evaluation.evaluation_results.gemini_score!) > 20
      ).length;
      
      const disagreementRate = (disagreements / bothScoresEvals.length) * 100;
      
      if (disagreementRate > 25) {
        cards.push({
          id: 'evaluator_disagreement',
          title: 'High Evaluator Disagreement',
          description: `${disagreementRate.toFixed(1)}% of evaluations have >20pt score difference`,
          value: `${disagreements}/${bothScoresEvals.length}`,
          severity: 'warning',
          category: 'consistency',
          trend: 'down'
        });
      }
    }

    // Technical accuracy insight
    const technicalEvals = evaluations.filter(evaluation => evaluation.question.category === 'technical');
    if (technicalEvals.length > 0) {
      const avgFactualConsistency = technicalEvals
        .map(evaluation => evaluation.evaluation_results.ml_details?.factual_consistency || evaluation.evaluation_results.details.factual_consistency || 0)
        .reduce((sum, score) => sum + score, 0) / technicalEvals.length;
      
      if (avgFactualConsistency < 60) {
        cards.push({
          id: 'technical_accuracy_low',
          title: 'Technical Accuracy Issues',
          description: `Average factual consistency in technical questions is low`,
          value: `${avgFactualConsistency.toFixed(1)}/100`,
          severity: 'warning',
          category: 'accuracy',
          trend: 'down'
        });
      }
    }

    // Toxicity insight
    const toxicEvaluations = evaluations.filter(evaluation => {
      const toxicity = evaluation.evaluation_results.ml_details?.toxicity || evaluation.evaluation_results.details.toxicity || 0;
      return toxicity > 30;
    });
    
    if (toxicEvaluations.length > 0) {
      const toxicityRate = (toxicEvaluations.length / evaluations.length) * 100;
      cards.push({
        id: 'toxicity_detected',
        title: 'Toxicity Detected',
        description: `${toxicityRate.toFixed(1)}% of responses show elevated toxicity`,
        value: `${toxicEvaluations.length}/${evaluations.length}`,
        severity: toxicityRate > 10 ? 'critical' : 'warning',
        category: 'safety',
        trend: 'down'
      });
    }

    // Readability insight
    const readabilityScores = evaluations
      .map(evaluation => evaluation.evaluation_results.ml_details?.readability || evaluation.evaluation_results.details.readability)
      .filter(score => score !== undefined) as number[];
    
    if (readabilityScores.length > 0) {
      const avgReadability = readabilityScores.reduce((sum, score) => sum + score, 0) / readabilityScores.length;
      const lowReadabilityCount = readabilityScores.filter(score => score < 30).length;
      
      if (lowReadabilityCount > readabilityScores.length * 0.2) {
        cards.push({
          id: 'readability_issues',
          title: 'Readability Challenges',
          description: `${((lowReadabilityCount / readabilityScores.length) * 100).toFixed(1)}% of responses have poor readability`,
          value: `${avgReadability.toFixed(1)}/100`,
          severity: 'warning',
          category: 'clarity',
          trend: 'down'
        });
      }
    }

    // Performance summary insight (always show)
    const avgScore = evaluations
      .map(evaluation => evaluation.evaluation_results.combined_score || evaluation.evaluation_results.ml_score || evaluation   .evaluation_results.gemini_score || 0)
      .reduce((sum, score) => sum + score, 0) / evaluations.length;
    
    cards.push({
      id: 'overall_performance',
      title: 'Overall Performance',
      description: `Average combined score across all evaluations`,
      value: `${avgScore.toFixed(1)}/100`,
      severity: avgScore >= 80 ? 'info' : avgScore >= 60 ? 'warning' : 'critical',
      category: 'performance',
      trend: avgScore >= 70 ? 'up' : 'down'
    });

    return cards;
  }, [evaluations]);

  const getSeverityIcon = (severity: InsightCard['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Users className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTrendIcon = (trend: InsightCard['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: InsightCard['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'info':
        return <Badge variant="default" className="bg-green-100 text-green-800">Good</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>No insights available with current data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Key Insights</h3>
        <Badge variant="outline">{insights.length} insight{insights.length !== 1 ? 's' : ''}</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <Card key={insight.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSeverityIcon(insight.severity)}
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(insight.trend)}
                  {getSeverityBadge(insight.severity)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {insight.value}
                </div>
                <CardDescription className="text-sm">
                  {insight.description}
                </CardDescription>
                <Badge variant="outline" className="text-xs">
                  {insight.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}