"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface QuizSummaryProps {
  score: number;
  maxScore: number;
  passed: boolean;
  timeTaken: number;
  onRetry: () => void;
}

export function QuizSummary({ score, maxScore, passed, timeTaken, onRetry }: QuizSummaryProps) {
  const pct = Math.round((score / maxScore) * 100);
  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <Card className="max-w-lg mx-auto text-center">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${passed ? "bg-green-500/20" : "bg-destructive/20"}`}>
            <Trophy className={`w-10 h-10 ${passed ? "text-green-400" : "text-destructive"}`} />
          </div>
        </div>
        <CardTitle className="text-2xl">{passed ? "Congratulations!" : "Keep Trying"}</CardTitle>
        <CardDescription>
          {passed ? "You passed the quiz!" : "You didn't pass this time."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Score</span>
            <span className="font-bold text-lg">{score}/{maxScore}</span>
          </div>
          <Progress value={pct} className="h-3" />
          <Badge variant={passed ? "success" : "destructive"} className="text-sm">
            {pct}% - {passed ? "Passed" : "Failed"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-card rounded-lg p-3">
            <p className="text-muted-foreground">Time</p>
            <p className="font-medium">{minutes}m {seconds}s</p>
          </div>
          <div className="bg-card rounded-lg p-3">
            <p className="text-muted-foreground">XP Earned</p>
            <p className="font-medium text-brand-400">+{passed ? maxScore : 10}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onRetry} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" /> Retry
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
