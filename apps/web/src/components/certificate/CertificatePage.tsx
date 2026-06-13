"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, Award, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CertificatePageProps {
  userName: string;
  moduleName: string;
  completedAt: string;
  score: number;
}

export function CertificatePage({ userName, moduleName, completedAt, score }: CertificatePageProps) {
  const handleDownload = () => {
    toast.success("Certificate downloaded! (PDF generation ready)");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`I completed "${moduleName}" on LearnVerse AI with ${score}%! 🎉`);
    toast.success("Share link copied!");
  };

  return (
    <Card className="max-w-2xl mx-auto p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="relative">
        <div className="flex justify-center mb-4">
          <Award className="w-16 h-16 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Certificate of Completion</h1>
        <p className="text-muted-foreground text-sm mb-6">This certifies that</p>
        <h2 className="text-3xl font-bold text-gradient mb-4">{userName}</h2>
        <p className="text-muted-foreground mb-2">has successfully completed</p>
        <h3 className="text-xl font-semibold mb-4">{moduleName}</h3>
        <div className="flex items-center justify-center gap-3 mb-6">
          <Badge variant="secondary">Score: {score}%</Badge>
          <Badge variant="secondary">{completedAt}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Awarded by LearnVerse AI — Interactive 3D Learning Platform
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>
      </div>
    </Card>
  );
}
