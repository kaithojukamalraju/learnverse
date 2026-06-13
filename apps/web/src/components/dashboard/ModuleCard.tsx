import Link from "next/link";

interface ModuleCardProps {
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  difficulty: string;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-400",
  intermediate: "bg-blue-500/20 text-blue-400",
  advanced: "bg-purple-500/20 text-purple-400",
};

export function ModuleCard({ title, slug, description, icon, color, difficulty }: ModuleCardProps) {
  return (
    <Link href={`/modules/${slug}`}>
      <div
        className="glass rounded-xl p-5 glass-hover transition-all duration-300 group cursor-pointer"
        style={{ borderColor: `${color}20` }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-white mb-1 group-hover:text-brand-300 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{description}</p>
        <span
          className={`text-xs px-2 py-1 rounded-full ${difficultyColors[difficulty] || difficultyColors.beginner}`}
        >
          {difficulty}
        </span>
      </div>
    </Link>
  );
}
