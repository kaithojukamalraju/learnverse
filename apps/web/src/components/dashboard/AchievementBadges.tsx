"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string; title: string; description: string; icon: string; unlocked: boolean; xp_reward: number;
}

interface AchievementBadgesProps { achievements: Achievement[] }

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-400" />
          Achievements ({unlocked.length}/{achievements.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all",
                a.unlocked ? "bg-yellow-500/10" : "bg-muted opacity-50"
              )}
            >
              <span className="text-2xl">{a.unlocked ? a.icon : <Lock className="w-5 h-5 text-muted-foreground" />}</span>
              <span className="text-xs font-medium leading-tight">{a.title}</span>
              {a.unlocked && <Badge variant="warning" className="text-[10px] px-1 py-0">+{a.xp_reward}XP</Badge>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
