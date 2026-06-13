"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoiceRecorder } from "./VoiceRecorder";
import { ChatPanel } from "./ChatPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function VoiceChat() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Nova AI - Voice & Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="chat">Text Chat</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
          </TabsList>
          <TabsContent value="chat">
            <div className="max-h-[400px] overflow-hidden">
              <ChatPanel />
            </div>
          </TabsContent>
          <TabsContent value="voice">
            <VoiceRecorder />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
