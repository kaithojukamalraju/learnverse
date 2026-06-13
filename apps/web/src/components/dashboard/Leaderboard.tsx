"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry { rank: number; name: string; xp: number; level: string; isCurrentUser?: boolean }

interface LeaderboardProps { entries: LeaderboardEntry[] }

export function Leaderboard({ entries }: LeaderboardProps) {
  const rankIcons = [Crown, Medal, Medal];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Medal className="w-4 h-4 text-yellow-400" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map((entry) => {
          const RankIcon = rankIcons[entry.rank - 1];
          return (
            <div
              key={entry.rank}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                entry.isCurrentUser ? "bg-primary/10 border border-primary/20" : "hover:bg-accent"
              )}
            >
              <div className="w-8 flex justify-center">
                {RankIcon ? <RankIcon className={cn("w-5 h-5", entry.rank === 1 ? "text-yellow-400" : entry.rank === 2 ? "text-slate-300" : "text-amber-600")} /> : (
                  <span className="text-sm font-medium text-muted-foreground">{entry.rank}</span>
                )}
              </div>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{entry.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{entry.level}</p>
              </div>
              <Badge variant="secondary">{entry.xp.toLocaleString()} XP</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
