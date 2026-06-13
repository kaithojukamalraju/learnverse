"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Atom, Code, ArrowRight, Check, GraduationCap } from "lucide-react";

const steps = [
  {
    title: "Welcome to LearnVerse AI!",
    desc: "Your interactive 3D learning platform with AI tutoring.",
    icon: Sparkles,
    color: "text-primary",
  },
  {
    title: "Explore in 3D",
    desc: "Interact with cells, physics simulations, and data structures in immersive 3D.",
    icon: Atom,
    color: "text-green-400",
  },
  {
    title: "Learn with Nova AI",
    desc: "Ask questions, get explanations, and chat with your AI tutor.",
    icon: Brain,
    color: "text-purple-400",
  },
  {
    title: "Track Your Progress",
    desc: "Earn XP, unlock achievements, and watch your skills grow.",
    icon: GraduationCap,
    color: "text-yellow-400",
  },
];

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const s = steps[step];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onComplete(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <s.icon className={`w-8 h-8 ${s.color}`} />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">{s.title}</DialogTitle>
        </DialogHeader>
        <p className="text-center text-muted-foreground">{s.desc}</p>
        <div className="flex justify-center gap-1.5 my-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === step ? "bg-primary w-4" : "bg-muted"}`} />
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => { setStep(steps.length - 1); }}>Skip</Button>
          <Button onClick={() => {
            if (step < steps.length - 1) setStep(step + 1);
            else onComplete();
          }}>
            {step < steps.length - 1 ? <>Next <ArrowRight className="w-4 h-4 ml-2" /></> : <>Get Started <Check className="w-4 h-4 ml-2" /></>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
