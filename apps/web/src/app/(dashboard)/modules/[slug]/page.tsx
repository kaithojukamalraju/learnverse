"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useRecentlyViewedStore } from "@/store";
import { ChatPanel } from "@/components/ai/ChatPanel";
import { VoiceChat } from "@/components/ai/VoiceChat";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ModuleSkeleton } from "@/components/dashboard/LoadingState";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ShareModule } from "@/components/dashboard/ShareModule";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Brain, Play, Code, ChevronRight, Sparkles, X } from "lucide-react";

const EnhancedCellExplorer = dynamic(() => import("@/components/3d/CellExplorer").then((m) => ({ default: m.CellExplorer })), { ssr: false });
const PhysicsSimulator = dynamic(() => import("@/components/3d/PhysicsSimulator").then((m) => ({ default: m.PhysicsSimulator })), { ssr: false });
const DSVisualizer = dynamic(() => import("@/components/3d/DSVisualizer").then((m) => ({ default: m.DSVisualizer })), { ssr: false });
const ChemistryLab = dynamic(() => import("@/components/3d/ChemistryLab").then((m) => ({ default: m.ChemistryLab })), { ssr: false });
const CodePlayground = dynamic(() => import("@/components/3d/CodePlayground").then((m) => ({ default: m.CodePlayground })), { ssr: false });

export default function ModuleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem } = useRecentlyViewedStore();
  const [mod, setMod] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLearning] = useState(true);
  const [activeTab, setActiveTab] = useState("learn");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [modData, lessonData] = await Promise.all([
          api.modules.get(slug),
          api.modules.lessons(slug),
        ]);
        setMod(modData);
        setLessons(lessonData);
        addItem({ id: modData.id, title: modData.title, slug: modData.slug, icon: modData.icon || "📚" });
      } catch (err) {
        console.error("Failed to load module", err);
      } finally {
        setLearning(false);
      }
    }
    load();
  }, [slug, addItem]);

  if (loading) return <ModuleSkeleton />;

  if (!mod) {
    return (
      <EmptyState
        title="Module not found"
        description="The module you're looking for doesn't exist or has been removed."
        actionLabel="Browse Modules"
        actionHref="/modules"
      />
    );
  }

  const handleAskTutor = (topic: string) => {
    setActiveTab("chat");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("ask-nova", {
          detail: { prompt: `Explain the function of the ${topic} in cell biology. What role does it play?` }
        })
      );
    }, 100);
  };

  const getTabs = () => {
    const tabs = [
      { value: "learn", label: "Learn", icon: BookOpen },
      { value: "simulate", label: "Simulate", icon: Play },
      { value: "chat", label: "AI Tutor", icon: Brain },
      { value: "voice", label: "Voice", icon: Sparkles },
    ];
    if (slug === "data-structures") {
      tabs.push({ value: "code", label: "Code", icon: Code });
    }
    return tabs;
  };

  const renderSimulator = () => {
    switch (slug) {
      case "cell-explorer": return <EnhancedCellExplorer onAskTutor={handleAskTutor} />;
      case "physics-lab": return <PhysicsSimulator />;
      case "chemistry-lab": return <ChemistryLab />;
      case "data-structures": return <DSVisualizer />;
      default: return (
        <Card className="flex items-center justify-center h-[400px] bg-slate-900/60 border-white/5">
          <div className="text-center">
            <div className="text-4xl mb-3">{mod.icon || "🔬"}</div>
            <p className="text-muted-foreground">3D interactive content coming soon</p>
          </div>
        </Card>
      );
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{mod.icon || "📚"}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{mod.title}</h1>
              <Badge variant="secondary">{mod.difficulty}</Badge>
            </div>
            <p className="text-muted-foreground text-sm">{mod.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShareModule title={mod.title} slug={mod.slug} />
          <Button onClick={() => router.push(`/quiz/${mod.id}`)}>
            <Brain className="w-4 h-4 mr-2" /> Take Quiz
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap bg-slate-900/60 p-1 border border-white/5">
          {getTabs().map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4" /> {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="learn" className="space-y-4 mt-6">
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Lessons
            </h2>
            {lessons.length === 0 ? (
              <p className="text-muted-foreground text-sm">No lessons available yet.</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson, i) => (
                  <div key={lesson.id} onClick={() => setSelectedLesson(lesson)} className="flex items-center justify-between glass rounded-lg p-4 glass-hover cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.duration_minutes} min</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
            {selectedLesson && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLesson(null)}>
                <div className="glass rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{selectedLesson.title}</h3>
                    <button onClick={() => setSelectedLesson(null)} className="p-1 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedLesson.content || "Content coming soon."}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                    <BookOpen className="w-3.5 h-3.5" /> {selectedLesson.duration_minutes} min
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="simulate" className="mt-6">
          {renderSimulator()}
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <ChatPanel />
        </TabsContent>

        <TabsContent value="voice" className="mt-6">
          <VoiceChat />
        </TabsContent>

        {slug === "data-structures" && (
          <TabsContent value="code" className="mt-6">
            <CodePlayground />
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
}
