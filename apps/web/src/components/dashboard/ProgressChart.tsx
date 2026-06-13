"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface DataPoint { label: string; value: number }
interface ProgressChartProps { data: DataPoint[]; title?: string }

export function ProgressChart({ data, title = "Progress" }: ProgressChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-32">
          {data.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-primary/20 rounded-t-md transition-all duration-500 hover:bg-primary/40"
                style={{ height: `${(d.value / maxVal) * 100}%` }}
              />
              <span className="text-xs text-muted-foreground">{d.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
