"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Mic, Square, Volume2, Loader2, Send, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let final = "";
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setTranscript((prev) => prev + " " + final);
          setInterimTranscript("");
        } else {
          setInterimTranscript(interim);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          alert("Permission to use microphone was denied.");
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  function startRecording() {
    if (!isSupported) {
      // Fallback behavior if speech recognition is not supported
      setIsRecording(true);
      setTranscript("Mock transcription: Web Speech API is not supported in this browser environment. Try Chrome/Edge for real voice input.");
      setTimeout(() => setIsRecording(false), 2000);
      return;
    }

    setTranscript("");
    setInterimTranscript("");
    setIsRecording(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  }

  function stopRecording() {
    if (isSupported && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }

  const handleSendToNova = () => {
    const finalQuery = (transcript + " " + interimTranscript).trim();
    if (!finalQuery) return;

    window.dispatchEvent(
      new CustomEvent("ask-nova", {
        detail: { prompt: finalQuery }
      })
    );

    // Clear transcript after sending
    setTranscript("");
    setInterimTranscript("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/20 p-4 rounded-xl border border-white/5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">Voice Dictation</p>
          <p className="text-xs text-slate-400">
            {isSupported 
              ? "Speak directly to Nova using your microphone."
              : "Microphone speech recognition is not supported in your browser. (Try Chrome or Edge)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSupported ? (
            <Badge variant="success" className="text-[10px]">Active</Badge>
          ) : (
            <Badge variant="destructive" className="text-[10px]">Limited Support</Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={isRecording ? "destructive" : "secondary"}
          size="lg"
          onClick={isRecording ? stopRecording : startRecording}
          className="relative text-xs font-semibold px-6"
        >
          {isRecording ? (
            <>
              <Square className="w-4 h-4 mr-2" /> Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2 text-indigo-400" /> Speak to Nova
            </>
          )}
        </Button>
        {isRecording && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs text-red-400 font-medium">Listening...</span>
          </div>
        )}
      </div>

      {/* Real-time speech result container */}
      {(transcript || interimTranscript) && (
        <Card className="p-4 bg-slate-950/40 border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2 text-xs">
              <Volume2 className="w-4 h-4 text-brand-400" />
              <span className="font-semibold text-slate-300">Live Transcript</span>
            </div>
            <Badge variant="outline" className="text-[10px] text-slate-400 font-mono">
              Speech-to-Text
            </Badge>
          </div>
          <div className="text-sm text-slate-200 leading-relaxed font-sans min-h-[40px]">
            {transcript}
            {interimTranscript && (
              <span className="text-slate-500 italic font-medium"> {interimTranscript}</span>
            )}
          </div>
          <div className="flex justify-end pt-2 border-t border-white/5">
            <Button 
              size="sm" 
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
              onClick={handleSendToNova}
            >
              <span>Ask Nova</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
