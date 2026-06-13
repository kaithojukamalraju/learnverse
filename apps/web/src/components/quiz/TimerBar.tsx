"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TimerBarProps {
  totalSeconds: number;
  onTimeUp: () => void;
}

export function TimerBar({ totalSeconds, onTimeUp }: TimerBarProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (remaining <= 0) { onTimeUp(); return; }
    const timer = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining, onTimeUp]);

  const pct = (remaining / totalSeconds) * 100;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Time remaining</span>
        <span className={cn("font-mono font-medium", remaining < 30 ? "text-destructive" : "text-foreground")}>
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>
      <Progress value={pct} className={cn("h-2", remaining < 30 ? " [&>div]:bg-destructive" : "")} />
    </div>
  );
}
