"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface MethodBreakdownBarProps {
  ml?: Record<string, number>;
  ai?: Record<string, number>;
}

// This view renders a compact comparison matrix instead of a chart
export function MethodBreakdownBar({ ml, ai }: MethodBreakdownBarProps) {
  const methodKeys = Array.from(
    new Set([...(ml ? Object.keys(ml) : []), ...(ai ? Object.keys(ai) : [])])
  );

  const rows = methodKeys.map((key) => ({
    method: key.toUpperCase(),
    ml: (ml?.[key] ?? 0) > 0,
    ai: (ai?.[key] ?? 0) > 0,
  }));

  const total = rows.length;
  const mlTrue = rows.filter((r) => r.ml).length;
  const aiTrue = rows.filter((r) => r.ai).length;

  if (total === 0) {
    return (
      <Card className="col-span-2 bg-card border border-[--color-border]">
        <CardHeader>
          <CardTitle>Method Presence (ML vs AI)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">No method data available.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2 bg-card border border-[--color-border]">
      <CardHeader>
        <CardTitle>Method Presence (ML vs AI)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex gap-2 text-sm">
          <Badge variant="outline" className="gap-1"><span className="inline-block size-2 rounded-full bg-[hsl(var(--chart-3))]"></span> AI: {aiTrue}/{total}</Badge>
          <Badge variant="outline" className="gap-1"><span className="inline-block size-2 rounded-full bg-[hsl(var(--chart-2))]"></span> ML: {mlTrue}/{total}</Badge>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] gap-y-2 text-sm">
          <div className="text-muted-foreground font-medium">Method</div>
          <div className="text-center text-muted-foreground font-medium">AI</div>
          <div className="text-center text-muted-foreground font-medium">ML</div>
          {rows.map((row) => (
            <React.Fragment key={row.method}>
              <div className="pr-2 truncate">{row.method}</div>
              <div className="flex items-center justify-center">
                {row.ai ? (
                  <Check className="h-4 w-4 text-[hsl(var(--chart-3))]" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-center">
                {row.ml ? (
                  <Check className="h-4 w-4 text-[hsl(var(--chart-2))]" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

