"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Brain, Clock, Target, TrendingUp, Award } from "lucide-react";

const stats = [
  { label: "Total XP", value: "1,250", icon: Sparkles, color: "text-yellow-400" },
  { label: "Lessons Done", value: "24", icon: Brain, color: "text-primary" },
  { label: "Study Hours", value: "18.5", icon: Clock, color: "text-blue-400" },
  { label: "Avg Score", value: "87%", icon: Target, color: "text-green-400" },
  { label: "Streak", value: "5 days", icon: TrendingUp, color: "text-orange-400" },
  { label: "Achievements", value: "3/6", icon: Award, color: "text-purple-400" },
];

const modulesData = [
  { name: "Cell Explorer", progress: 80, lessons: "4/5", score: 92 },
  { name: "Physics Lab", progress: 45, lessons: "2/5", score: 78 },
  { name: "Data Structures", progress: 20, lessons: "1/5", score: 85 },
  { name: "Chemistry Lab", progress: 0, lessons: "0/5", score: 0 },
];

export default function InsightsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Progress Insights</h1>
        <p className="text-muted-foreground text-sm">Track your learning journey</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="text-center">
              <CardContent className="p-4">
                <Icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart
          title="Daily XP Earned"
          data={[
            { label: "Mon", value: 120 },
            { label: "Tue", value: 200 },
            { label: "Wed", value: 80 },
            { label: "Thu", value: 350 },
            { label: "Fri", value: 150 },
            { label: "Sat", value: 280 },
            { label: "Sun", value: 90 },
          ]}
        />
        <ProgressChart
          title="Quiz Scores"
          data={[
            { label: "W1", value: 70 },
            { label: "W2", value: 75 },
            { label: "W3", value: 82 },
            { label: "W4", value: 88 },
            { label: "W5", value: 92 },
            { label: "W6", value: 87 },
          ]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Module Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {modulesData.map((mod) => (
            <div key={mod.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{mod.name}</p>
                  <p className="text-xs text-muted-foreground">{mod.lessons} lessons</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{mod.score > 0 ? `${mod.score}%` : "—"}</Badge>
                  <span className="text-xs text-muted-foreground w-8 text-right">{mod.progress}%</span>
                </div>
              </div>
              <Progress value={mod.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
