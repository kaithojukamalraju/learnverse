interface XpMeterProps {
  xp: number;
  level: string;
  streak: number;
}

export function XpMeter({ xp, level, streak }: XpMeterProps) {
  const xpForNext = level === "beginner" ? 500 : level === "intermediate" ? 2000 : 5000;
  const progress = Math.min((xp / xpForNext) * 100, 100);

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Level</p>
          <p className="text-lg font-bold capitalize text-gradient">{level}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Streak</p>
          <p className="text-lg font-bold text-orange-400">{streak} days</p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-400">
          <span>{xp} XP</span>
          <span>{xpForNext} XP</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
