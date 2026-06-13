"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: ["⌘", "K"], label: "Open search" },
  { keys: ["⌘", "D"], label: "Go to dashboard" },
  { keys: ["⌘", "M"], label: "Go to modules" },
  { keys: ["⌘", "I"], label: "Go to insights" },
  { keys: ["⌘", "P"], label: "Go to playground" },
  { keys: ["⌘", ","], label: "Open settings" },
  { keys: ["⌘", "L"], label: "Toggle theme" },
  { keys: ["?"], label: "Show shortcuts" },
];

export function KeyboardShortcutsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" /> Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.label} className="flex items-center justify-between py-1.5">
              <span className="text-sm">{s.label}</span>
              <kbd className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <span key={k} className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">{k}</span>
                ))}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useKeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) { setOpen(true); return; }
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "d": e.preventDefault(); window.location.href = "/dashboard"; break;
          case "m": e.preventDefault(); window.location.href = "/modules"; break;
          case "i": e.preventDefault(); window.location.href = "/insights"; break;
          case "p": e.preventDefault(); window.location.href = "/playground"; break;
          case ",": e.preventDefault(); window.location.href = "/profile"; break;
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}
