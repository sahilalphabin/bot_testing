'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartSkeletonProps {
  title?: string;
  description?: string;
  height?: string;
}

export function ChartSkeleton({ 
  title = "Loading chart...", 
  description = "Please wait while we load your data",
  height = "h-96"
}: ChartSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title ? title : <Skeleton className="h-6 w-48" />}
        </CardTitle>
        <CardDescription>
          {description ? description : <Skeleton className="h-4 w-64" />}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${height} flex items-center justify-center`}>
          <div className="w-full h-full space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex space-x-2">
              <Skeleton className="h-32 w-1/4" />
              <Skeleton className="h-24 w-1/4" />
              <Skeleton className="h-40 w-1/4" />
              <Skeleton className="h-28 w-1/4" />
            </div>
            <div className="flex space-x-2 justify-center">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}