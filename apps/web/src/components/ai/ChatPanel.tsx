"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { Send, Bot, User, MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Nova, your AI tutor. Ask me anything about what you're learning!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg = text.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const { response, session_id } = await api.ai.chat(userMsg, sessionId);
      setSessionId(session_id);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  // Handle cross-component ask-nova prompt triggers
  useEffect(() => {
    const handleAskNova = (e: Event) => {
      const customEvent = e as CustomEvent;
      const prompt = customEvent.detail?.prompt;
      if (prompt) {
        setInput(prompt);
        sendMessage(prompt);
      }
    };

    window.addEventListener("ask-nova", handleAskNova);
    return () => window.removeEventListener("ask-nova", handleAskNova);
  }, [sessionId, loading]); // Include dependencies to ensure it captures the current session state

  return (
    <div className="glass rounded-xl flex flex-col h-[500px] bg-slate-900/40 border-white/5">
      <div className="p-4 border-b border-white/5 bg-slate-950/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <span className="font-semibold text-sm text-white block">Nova AI Tutor</span>
            <span className="text-[10px] text-slate-400 block">Personal learning assistant</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/10">
                <Bot className="w-4 h-4 text-brand-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed border ${
                msg.role === "user"
                  ? "bg-brand-600 text-white border-brand-500 shadow-md"
                  : "bg-slate-900/60 text-slate-200 border-white/5 shadow-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-white/10">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/10">
              <Bot className="w-4 h-4 text-brand-400" />
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5">
              <div className="flex gap-1.5 items-center py-1.5">
                <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {[
            "What is a cell?",
            "What is a linked list?",
            "Explain Newton's laws",
            "What is DNA?",
            "How do batteries work?",
            "What is a hash table?",
          ].map((s) => (
            <button key={s} onClick={() => sendMessage(s)} disabled={loading} className="text-[11px] px-2.5 py-1.5 rounded-full bg-slate-800/60 border border-white/5 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-slate-950/20 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Nova anything..."
          className="flex-1 bg-slate-950/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
