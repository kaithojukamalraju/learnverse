"use client";

import { useThemeStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative">
      <AnimatePresence mode="wait">
        {theme === "dark" ? (
          <motion.span key="sun" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Sun className="w-4 h-4" />
          </motion.span>
        ) : (
          <motion.span key="moon" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}>
            <Moon className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
