"use client";

import dynamic from "next/dynamic";

const CodePlayground = dynamic(() => import("@/components/3d/CodePlayground").then((m) => ({ default: m.CodePlayground })), { ssr: false });
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";

export default function PlaygroundPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Code className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Code Playground</h1>
          <p className="text-muted-foreground text-sm">Practice algorithms and data structures interactively</p>
        </div>
      </div>

      <CodePlayground />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Arrays", desc: "Sort, search, and manipulate arrays", color: "#6366f1" },
          { title: "Linked Lists", desc: "Traverse and modify linked structures", color: "#22c55e" },
          { title: "Trees", desc: "Binary trees, BST, and traversals", color: "#a855f7" },
        ].map((topic) => (
          <Card key={topic.title} className="cursor-pointer hover:bg-accent transition-colors" style={{ borderColor: `${topic.color}30` }}>
            <CardContent className="p-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-2" style={{ backgroundColor: `${topic.color}20`, color: topic.color }}>
                {topic.title[0]}
              </div>
              <p className="font-medium text-sm">{topic.title}</p>
              <p className="text-xs text-muted-foreground">{topic.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
