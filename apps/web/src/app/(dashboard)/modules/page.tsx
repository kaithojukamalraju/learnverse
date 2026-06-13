"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { BookOpen } from "lucide-react";

export default function ModulesPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.modules.list().then(setModules).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-brand-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">All Modules</h1>
          <p className="text-slate-400 text-sm">Choose a subject to start learning</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
}
