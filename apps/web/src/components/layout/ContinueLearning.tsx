"use client";

import { useRecentlyViewedStore } from "@/store";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

export function ContinueLearning() {
  const { items } = useRecentlyViewedStore();
  if (items.length === 0) return null;

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">Continue Learning</h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            href={`/modules/${item.slug}`}
            className="flex items-center gap-2 bg-card rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors shrink-0"
          >
            <span>{item.icon}</span>
            <span className="whitespace-nowrap">{item.title}</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
