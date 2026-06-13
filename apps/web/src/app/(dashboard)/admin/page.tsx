"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, BarChart3, BookOpen, Brain, Trash2, Shield } from "lucide-react";

const mockUsers = [
  { id: "1", name: "Alex Chen", email: "alex@example.com", role: "student", xp: 2840, level: "advanced" },
  { id: "2", name: "Sarah Kim", email: "sarah@example.com", role: "student", xp: 2150, level: "intermediate" },
  { id: "3", name: "Admin User", email: "admin@learnverse.ai", role: "admin", xp: 9999, level: "advanced" },
  { id: "4", name: "Jordan Lee", email: "jordan@example.com", role: "student", xp: 980, level: "beginner" },
];

const mockAnalytics = { totalUsers: 1247, totalModules: 8, totalLessons: 42, totalQuizAttempts: 3851, avgScore: 76 };

export default function AdminPage() {
  const [users] = useState(mockUsers);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform management and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Users", value: mockAnalytics.totalUsers, icon: Users, color: "text-primary" },
          { label: "Modules", value: mockAnalytics.totalModules, icon: BookOpen, color: "text-green-400" },
          { label: "Lessons", value: mockAnalytics.totalLessons, icon: BarChart3, color: "text-blue-400" },
          { label: "Quiz Attempts", value: mockAnalytics.totalQuizAttempts, icon: Brain, color: "text-purple-400" },
          { label: "Avg Score", value: `${mockAnalytics.avgScore}%`, icon: BarChart3, color: "text-yellow-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <Icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
                <p className="text-lg font-bold">{s.value.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-4 h-4" /> User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg glass">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">{u.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{u.name}</span>
                      {u.role === "admin" && <Badge variant="destructive" className="text-[10px] px-1">Admin</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email} · {u.xp} XP</p>
                  </div>
                </div>
                {u.role !== "admin" && (
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
