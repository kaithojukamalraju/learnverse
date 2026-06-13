import { create } from "zustand";

interface User {
  id: string; name: string; email: string; role: string;
  level: string; xp: number; streak: number; avatar_url: string | null;
}

interface AppState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));

interface ThemeState {
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (t: "dark" | "light") => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark",
  toggleTheme: () => set((s) => {
    const next = s.theme === "dark" ? "light" : "dark";
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", next === "light");
      localStorage.setItem("theme", next);
    }
    return { theme: next };
  }),
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", theme === "light");
      localStorage.setItem("theme", theme);
    }
    set({ theme });
  },
}));

interface Notification {
  id: string; title: string; body: string; type: string; is_read: boolean; created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications], unreadCount: s.unreadCount + 1 })),
  markRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) => n.id === id ? { ...n, is_read: true } : n),
    unreadCount: s.unreadCount - 1,
  })),
}));

interface RecentlyViewed {
  id: string; title: string; slug: string; icon: string; viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewed[];
  addItem: (item: Omit<RecentlyViewed, "viewedAt">) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>((set) => ({
  items: typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("recentlyViewed") || "[]")
    : [],
  addItem: (item) => set((s) => {
    const filtered = s.items.filter((i) => i.id !== item.id);
    const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, 5);
    localStorage.setItem("recentlyViewed", JSON.stringify(next));
    return { items: next };
  }),
}));

interface SearchState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: "focus" | "break";
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  toggleMode: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  minutes: 25,
  seconds: 0,
  isRunning: false,
  mode: "focus",
  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => set({ minutes: get().mode === "focus" ? 25 : 5, seconds: 0, isRunning: false }),
  tick: () => {
    const { minutes, seconds, mode, isRunning } = get();
    if (!isRunning) return;
    if (minutes === 0 && seconds === 0) {
      set({ mode: mode === "focus" ? "break" : "focus", minutes: mode === "focus" ? 5 : 25, seconds: 0 });
      return;
    }
    if (seconds === 0) set({ minutes: minutes - 1, seconds: 59 });
    else set({ seconds: seconds - 1 });
  },
  toggleMode: () => set((s) => ({ mode: s.mode === "focus" ? "break" : "focus", minutes: s.mode === "focus" ? 5 : 25, seconds: 0, isRunning: false })),
}));

interface ModuleProgress {
  moduleId: string; completedLessons: number; totalLessons: number; score: number;
}

interface ProgressState {
  moduleProgress: Record<string, ModuleProgress>;
  totalXp: number;
  setModuleProgress: (id: string, p: ModuleProgress) => void;
  addXp: (amount: number) => void;
}

export const useProgressStore = create<ProgressState>((set) => ({
  moduleProgress: {},
  totalXp: 0,
  setModuleProgress: (id, p) => set((s) => ({ moduleProgress: { ...s.moduleProgress, [id]: p } })),
  addXp: (amount) => set((s) => ({ totalXp: s.totalXp + amount })),
}));
