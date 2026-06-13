"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, Brain, LayoutDashboard, Settings, Sparkles,
  BarChart3, User, Code, FlaskConical, Atom, Shield,
  BookOpenText, Award, GraduationCap, FlaskConical as Chem,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/modules", label: "Modules", icon: BookOpen },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/playground", label: "Code Lab", icon: Code },
];

const moduleNav = [
  { href: "/modules/cell-explorer", label: "Cell Explorer", icon: Atom },
  { href: "/modules/physics-lab", label: "Physics Lab", icon: FlaskConical },
  { href: "/modules/chemistry-lab", label: "Chemistry Lab", icon: Chem },
  { href: "/modules/data-structures", label: "Data Structures", icon: Brain },
];

const extrasNav = [
  { href: "/certificate", label: "Certificate", icon: Award },
  { href: "/docs", label: "API Docs", icon: BookOpenText },
  { href: "/admin", label: "Admin", icon: Shield },
];

const bottomNav = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen glass border-r border-border fixed left-0 top-0 p-4 flex-col hidden md:flex z-40">
      <Link href="/dashboard" className="flex items-center gap-2 mb-6 px-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg text-gradient">LearnVerse</span>
      </Link>

      <div className="flex-1 space-y-6 overflow-y-auto">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-1 font-medium">Main</p>
          <nav className="space-y-0.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                    active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-1 font-medium">Modules</p>
          <nav className="space-y-0.5">
            {moduleNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                    active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 mb-1 font-medium">Resources</p>
          <nav className="space-y-0.5">
            {extrasNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                    active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-border space-y-0.5">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                active ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="w-4 h-4" /> {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
