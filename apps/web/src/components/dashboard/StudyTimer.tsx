"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StudyTimer() {
  const { minutes, seconds, isRunning, mode, start, pause, reset, tick, toggleMode } = useTimerStore();

  useEffect(() => {
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const pct = mode === "focus" ? ((25 - minutes - seconds / 60) / 25) * 100 : ((5 - minutes - seconds / 60) / 5) * 100;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TimerIcon className="w-4 h-4 text-primary" />
          Study Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <Badge variant={mode === "focus" ? "default" : "secondary"} className="mb-3">
          {mode === "focus" ? "Focus Time" : "Break"}
        </Badge>
        <div className="text-4xl font-bold font-mono mb-4">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-4">
          <div className={cn("h-full rounded-full transition-all", mode === "focus" ? "bg-primary" : "bg-green-500")} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" onClick={isRunning ? pause : start}>
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleMode}>
            Switch to {mode === "focus" ? "Break" : "Focus"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
