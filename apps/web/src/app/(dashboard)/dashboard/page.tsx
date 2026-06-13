"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAppStore } from "@/store";
import { XpMeter } from "@/components/dashboard/XpMeter";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { AchievementBadges } from "@/components/dashboard/AchievementBadges";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { RecommendationCard } from "@/components/dashboard/RecommendationCard";
import { StudyTimer } from "@/components/dashboard/StudyTimer";
import { ContinueLearning } from "@/components/layout/ContinueLearning";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { DashboardSkeleton } from "@/components/dashboard/LoadingState";
import { Sparkles, Brain, TrendingUp } from "lucide-react";
import Link from "next/link";

const mockAchievements = [
  { id: "1", title: "First Steps", description: "Complete first lesson", icon: "⭐", unlocked: true, xp_reward: 50 },
  { id: "2", title: "Quiz Master", description: "Score 100% on a quiz", icon: "🏆", unlocked: true, xp_reward: 100 },
  { id: "3", title: "Streak Starter", description: "3-day streak", icon: "🔥", unlocked: false, xp_reward: 75 },
  { id: "4", title: "Knowledge Seeker", description: "10 lessons", icon: "📚", unlocked: false, xp_reward: 200 },
  { id: "5", title: "Speed Demon", description: "Fast quiz score", icon: "⚡", unlocked: true, xp_reward: 150 },
  { id: "6", title: "Explorer", description: "Try all modules", icon: "🧭", unlocked: false, xp_reward: 300 },
];

const mockLeaderboard = [
  { rank: 1, name: "Alex Chen", xp: 2840, level: "advanced" },
  { rank: 2, name: "Sarah Kim", xp: 2150, level: "intermediate" },
  { rank: 3, name: "Jordan Lee", xp: 1890, level: "intermediate" },
  { rank: 4, name: "You", xp: 1250, level: "intermediate", isCurrentUser: true },
  { rank: 5, name: "Taylor Wu", xp: 980, level: "beginner" },
];

const mockRecommendations = [
  { id: "1", title: "Cell Membrane Transport", description: "Continue where you left off", type: "lesson" as const, slug: "cell-explorer", reason: "Based on your progress" },
  { id: "2", title: "Newton's Laws Simulation", description: "Interactive physics lab", type: "module" as const, slug: "physics-lab", reason: "Recommended for your level" },
  { id: "3", title: "Binary Trees Deep Dive", description: "Advanced data structures", type: "lesson" as const, slug: "data-structures", reason: "Next in your learning path" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAppStore();

  useEffect(() => {
    async function load() {
      try {
        const [mods, userData] = await Promise.all([
          api.modules.list(),
          api.auth.me().catch(() => null),
        ]);
        setModules(mods);
        if (userData) setStats({ xp: userData.xp, streak: userData.streak, level: userData.level });
      } catch (err) {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-8">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <Breadcrumbs />
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || "Learner"}</h1>
          <p className="text-muted-foreground mt-1">Continue your learning journey</p>
        </div>
        <Link href="/modules" className="text-sm text-primary hover:underline hidden sm:block">View all modules →</Link>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <XpMeter xp={stats?.xp || 0} level={stats?.level || "beginner"} streak={stats?.streak || 0} />
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Modules</p>
          <p className="text-lg font-bold">{modules.length} available</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Streak</p>
          <p className="text-lg font-bold">{stats?.streak || 0} days</p>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">AI Sessions</p>
          <p className="text-lg font-bold">12 total</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <ContinueLearning />
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Learning Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((mod) => (
                <ModuleCard
                  key={mod.id}
                  title={mod.title}
                  slug={mod.slug}
                  description={mod.description || ""}
                  icon={mod.icon || "📚"}
                  color={mod.color || "#6366f1"}
                  difficulty={mod.difficulty}
                />
              ))}
            </div>
          </div>

          <ProgressChart
            title="Weekly Activity"
            data={[
              { label: "Mon", value: 3 },
              { label: "Tue", value: 5 },
              { label: "Wed", value: 2 },
              { label: "Thu", value: 7 },
              { label: "Fri", value: 4 },
              { label: "Sat", value: 6 },
              { label: "Sun", value: 1 },
            ]}
          />

          <AchievementBadges achievements={mockAchievements} />
        </div>

        <div className="space-y-6">
          <StudyTimer />
          <RecommendationCard recommendations={mockRecommendations} />
          <Leaderboard entries={mockLeaderboard} />
        </div>
      </motion.div>
    </motion.div>
  );
}
