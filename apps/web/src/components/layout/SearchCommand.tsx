"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "@/store";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem,
} from "@/components/ui/command";
import { BookOpen, Atom, Code, FlaskConical, LayoutDashboard, Search } from "lucide-react";

const items = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "modules", label: "All Modules", icon: BookOpen, href: "/modules" },
  { id: "cell", label: "Cell Explorer", icon: Atom, href: "/modules/cell-explorer" },
  { id: "physics", label: "Physics Lab", icon: FlaskConical, href: "/modules/physics-lab" },
  { id: "ds", label: "Data Structures", icon: Code, href: "/modules/data-structures" },
  { id: "insights", label: "Progress Insights", icon: Search, href: "/insights" },
  { id: "profile", label: "Profile & Settings", icon: Search, href: "/profile" },
];

export function SearchCommand() {
  const router = useRouter();
  const { open, setOpen } = useSearchStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(!open); }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search modules, lessons, or actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem key={item.id} onSelect={() => { router.push(item.href); setOpen(false); }}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
