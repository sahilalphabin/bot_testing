'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Database, Filter, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyChartProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
  height?: string;
}

export function EmptyChart({ 
  title, 
  description = "No data available to display this chart",
  icon: Icon = BarChart3,
  actionLabel,
  onAction,
  height = "h-96"
}: EmptyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${height} flex flex-col items-center justify-center text-center space-y-4`}>
          <div className="rounded-full bg-muted p-6">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-muted-foreground">No Data Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              This chart will display data once you have evaluation results that match your current filters.
            </p>
          </div>
          {actionLabel && onAction && (
            <Button variant="outline" onClick={onAction} className="mt-4">
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}