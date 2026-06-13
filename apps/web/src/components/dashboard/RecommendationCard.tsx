"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";

interface Recommendation {
  id: string; title: string; description: string; type: "module" | "lesson"; slug: string; reason: string;
}

interface RecommendationCardProps { recommendations: Recommendation[] }

export function RecommendationCard({ recommendations }: RecommendationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => (
          <Link key={rec.id} href={`/modules/${rec.slug}`}>
            <div className="glass rounded-lg p-3 glass-hover transition-colors group">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
              <Badge variant="secondary" className="mt-2 text-[10px]">{rec.type}</Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
