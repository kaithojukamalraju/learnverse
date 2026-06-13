"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAppStore, useSearchStore } from "@/store";
import { LogOut, User, Search, Sparkles, Keyboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchCommand } from "@/components/layout/SearchCommand";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Button } from "@/components/ui/button";
import { KeyboardShortcutsModal, useKeyboardShortcuts } from "@/components/layout/KeyboardShortcuts";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export function TopNav() {
  const router = useRouter();
  const { user, setUser, logout } = useAppStore();
  const { setOpen } = useSearchStore();
  const { open: shortcutsOpen, setOpen: setShortcutsOpen } = useKeyboardShortcuts();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token") && !user) {
      api.auth.me().then(setUser).catch(() => {});
    }
    const seen = localStorage.getItem("onboardingSeen");
    if (!seen) { setTimeout(() => setOnboardingOpen(true), 500); }
  }, [user, setUser]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <>
      <SearchCommand />
      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <OnboardingWizard open={onboardingOpen} onComplete={() => { setOnboardingOpen(false); localStorage.setItem("onboardingSeen", "true"); }} />
      <header className="h-16 glass border-b border-border fixed top-0 right-0 left-0 md:left-64 z-30 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="hidden md:flex items-center gap-2 glass rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-64"
          >
            <Search className="w-4 h-4" />
            <span>Search modules...</span>
            <kbd className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setShortcutsOpen(true)} className="hidden md:flex">
            <Keyboard className="w-4 h-4" />
          </Button>
          <NotificationBell />
          <ThemeToggle />
          {user && (
            <>
              <div className="hidden md:flex items-center gap-2 text-sm mr-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground">{user.name}</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {user.xp} XP
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </header>
    </>
  );
}
