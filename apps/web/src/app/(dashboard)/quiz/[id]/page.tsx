"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";

const sampleQuestions = [
  { id: "1", text: "What is the basic unit of life?", type: "multiple_choice", options: ["Atom", "Cell", "Tissue", "Organ"], correct_answer: "Cell", points: 10 },
  { id: "2", text: "Which organelle is known as the powerhouse of the cell?", type: "multiple_choice", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"], correct_answer: "Mitochondria", points: 10 },
  { id: "3", text: "The cell membrane is selectively permeable.", type: "true_false", options: ["True", "False"], correct_answer: "True", points: 5 },
  { id: "4", text: "What does DNA stand for?", type: "multiple_choice", options: ["Deoxyribonucleic Acid", "Ribonucleic Acid", "Double Helix Acid", "None"], correct_answer: "Deoxyribonucleic Acid", points: 10 },
  { id: "5", text: "Photosynthesis occurs in which organelle?", type: "multiple_choice", options: ["Mitochondria", "Chloroplast", "Nucleus", "Ribosome"], correct_answer: "Chloroplast", points: 10 },
];

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Cell Biology Quiz</h1>
          <p className="text-sm text-muted-foreground">Test your knowledge</p>
        </div>
      </div>

      <QuizEngine
        questions={sampleQuestions}
        timeLimitSeconds={300}
        onComplete={(answers, timeTaken) => {
          console.log("Quiz complete", { answers, timeTaken });
        }}
      />
    </div>
  );
}
