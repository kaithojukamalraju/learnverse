"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const { setTheme } = useThemeStore();

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setTheme(initial);
  }, [setTheme]);

  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster position="top-right" richColors closeButton theme="dark" />
    </TooltipProvider>
  );
}
