"use client";

import { useState, useCallback } from "react";
import { TimerBar } from "./TimerBar";
import { QuestionCard } from "./QuestionCard";
import { QuizSummary } from "./QuizSummary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  correct_answer: string;
  points: number;
}

interface QuizEngineProps {
  questions: Question[];
  timeLimitSeconds: number;
  onComplete: (answers: { question_id: string; answer: string }[], timeTaken: number) => void;
}

export function QuizEngine({ questions, timeLimitSeconds, onComplete }: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTime] = useState(Date.now());

  const current = questions[currentIndex];
  const selectedAnswer = answers[current?.id] || null;

  const handleAnswer = (answer: string) => {
    if (!submitted) setAnswers((a) => ({ ...a, [current.id]: answer }));
  };

  const handleSubmit = useCallback(() => {
    const taken = Math.round((Date.now() - startTime) / 1000);
    setTimeTaken(taken);
    setSubmitted(true);
    onComplete(Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer })), taken);
  }, [answers, startTime, onComplete]);

  const handleTimeUp = useCallback(() => {
    if (!submitted) handleSubmit();
  }, [submitted, handleSubmit]);

  if (submitted) {
    const score = questions.reduce((sum, q) => sum + (answers[q.id] === q.correct_answer ? q.points : 0), 0);
    const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
    return (
      <QuizSummary
        score={score}
        maxScore={maxScore}
        passed={score >= maxScore * 0.7}
        timeTaken={timeTaken}
        onRetry={() => { setSubmitted(false); setAnswers({}); setCurrentIndex(0); }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <TimerBar totalSeconds={timeLimitSeconds} onTimeUp={handleTimeUp} />

      <QuestionCard
        question={current}
        index={currentIndex}
        total={questions.length}
        selectedAnswer={selectedAnswer}
        onAnswer={handleAnswer}
      />

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Previous
        </Button>

        {currentIndex < questions.length - 1 ? (
          <Button onClick={() => setCurrentIndex((i) => i + 1)}>
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>
            <Send className="w-4 h-4 mr-2" /> Submit
          </Button>
        )}
      </div>
    </div>
  );
}
