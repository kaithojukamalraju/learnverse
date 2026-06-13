"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, Code, Server, Database } from "lucide-react";

const endpoints = [
  { method: "POST", path: "/api/auth/register", auth: false, desc: "Create a new account" },
  { method: "POST", path: "/api/auth/login", auth: false, desc: "Sign in and get JWT" },
  { method: "GET", path: "/api/auth/me", auth: true, desc: "Get current user" },
  { method: "GET", path: "/api/modules", auth: false, desc: "List all published modules" },
  { method: "GET", path: "/api/modules/:slug", auth: false, desc: "Get module by slug" },
  { method: "GET", path: "/api/modules/:slug/lessons", auth: false, desc: "Get lessons for a module" },
  { method: "POST", path: "/api/ai/chat", auth: true, desc: "Chat with Nova AI tutor" },
  { method: "POST", path: "/api/quizzes/start", auth: true, desc: "Start a quiz attempt" },
  { method: "POST", path: "/api/quizzes/submit", auth: true, desc: "Submit quiz answers" },
  { method: "POST", path: "/api/voice/stt", auth: true, desc: "Speech-to-text conversion" },
  { method: "POST", path: "/api/voice/tts", auth: true, desc: "Text-to-speech conversion" },
  { method: "GET", path: "/api/progress/:userId", auth: false, desc: "Get user progress" },
];

const methodColors: Record<string, string> = { GET: "bg-green-500/20 text-green-400", POST: "bg-blue-500/20 text-blue-400", DELETE: "bg-red-500/20 text-red-400" };

export default function APIDocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Code className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground text-sm">LearnVerse AI REST API reference</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Base URL</CardTitle>
        </CardHeader>
        <CardContent>
          <code className="bg-muted px-3 py-2 rounded-md text-sm">http://localhost:4000/api</code>
          <p className="text-sm text-muted-foreground mt-2">All requests return JSON. Auth via <code className="bg-muted px-1 rounded text-xs">Authorization: Bearer &lt;token&gt;</code></p>
        </CardContent>
      </Card>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints"><Server className="w-4 h-4 mr-2" /> Endpoints</TabsTrigger>
          <TabsTrigger value="models"><Database className="w-4 h-4 mr-2" /> Models</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="mt-4 space-y-2">
          {endpoints.map((ep) => (
            <Card key={ep.path}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={methodColors[ep.method]}>{ep.method}</Badge>
                  <div>
                    <code className="text-sm font-mono">{ep.path}</code>
                    <p className="text-xs text-muted-foreground">{ep.desc}</p>
                  </div>
                </div>
                {ep.auth ? <Badge variant="outline" className="text-[10px]">Auth</Badge> : <Badge variant="outline" className="text-[10px] text-green-400">Public</Badge>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="models" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Full schema available in <code className="bg-muted px-1 rounded text-xs">packages/types/index.ts</code></p>
              <div className="mt-4 space-y-3">
                {["User", "Module", "Lesson", "Quiz", "Question", "QuizAttempt", "Progress", "Achievement", "AIChat"].map((m) => (
                  <div key={m} className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <code className="font-mono">{m}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
