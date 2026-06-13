"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  points: number;
}

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  correctAnswer?: string;
}

export function QuestionCard({ question, index, total, selectedAnswer, onAnswer, showResult, correctAnswer }: QuestionCardProps) {
  const isCorrect = showResult && selectedAnswer === correctAnswer;
  const isWrong = showResult && selectedAnswer && selectedAnswer !== correctAnswer;

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">Question {index + 1} of {total}</Badge>
          <span className="text-xs text-muted-foreground">{question.points} pts</span>
        </div>
        <CardTitle className="text-lg">{question.text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option;
          const showCorrect = showResult && option === correctAnswer;
          return (
            <button
              key={option}
              onClick={() => !showResult && onAnswer(option)}
              disabled={showResult}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all text-sm",
                isSelected && !showResult && "border-primary bg-primary/10",
                showCorrect && "border-green-500 bg-green-500/10 text-green-400",
                isWrong && isSelected && "border-destructive bg-destructive/10 text-destructive",
                !isSelected && !showResult && "border-border hover:border-primary/50 hover:bg-accent",
                showResult && !showCorrect && "opacity-60"
              )}
            >
              {option}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
