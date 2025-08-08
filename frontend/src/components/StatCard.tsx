import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="bg-[--color-card] border border-[--color-border]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[--color-muted-foreground]">{title}</CardTitle>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[--color-muted]">
            <Icon className="h-4 w-4 text-[--color-muted-foreground]" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-[--color-muted-foreground] mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center pt-1">
            <span
              className={`text-xs font-medium ${
                trend.value > 0
                  ? "text-green-500"
                  : trend.value < 0
                  ? "text-red-500"
                  : "text-[--color-muted-foreground]"
              }`}
            >
              {trend.value > 0 ? "+" : ""}{trend.value}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}