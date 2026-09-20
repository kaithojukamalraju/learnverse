# LearnVerse AI — Project Write-Up

**Submitted by:** [YOUR NAME]  
**Role:** Frontend Developer  
**Date:** June 2026  
**GitHub:** https://github.com/kaithojukamalraju/learnverse

---

## 1. Problem Statement

Traditional e-learning platforms rely on static text and video — passive content that leads to low engagement and poor retention. Students struggle with abstract subjects like cell biology, physics simulations, and data structures because they can't *interact* with the material. There's also no unified platform that combines AI tutoring, 3D visualization, gamification, and adaptive testing in one place.

---

## 2. Solution — What is LearnVerse AI?

LearnVerse AI is an interactive learning platform that makes complex subjects **visible, tangible, and fun**. It combines:

| Feature | What it does |
|---------|-------------|
| 🧊 3D Simulations | Interactive cell, physics, and data structure models via Three.js |
| 🤖 Nova AI Tutor | Gemini-powered contextual AI chat that answers questions in real time |
| 🎙️ Voice Chat | Speak naturally to the AI — hands-free learning |
| 📝 Adaptive Quizzes | Timed quizzes with instant feedback and AI-generated explanations |
| 🏆 Gamification | XP, streaks, achievement badges, and global leaderboards |
| 📊 Progress Analytics | Visual charts tracking learning activity and knowledge gaps |

---

## 3. Tech Stack (Frontend Focus)

### Core
- **Framework:** Next.js 15 (App Router, React Server Components, Client Components)
- **Language:** TypeScript 5.4 (strict mode)
- **Styling:** TailwindCSS 3.4 + custom glassmorphism design system
- **Animation:** Framer Motion 11 (page transitions, micro-interactions, scroll effects)

### UI & Components
- **Headless UI:** Radix UI primitives (Dialog, Tabs, Popover, Scroll Area, Tooltip, Slider, Switch)
- **Icons:** Lucide React
- **Command palette:** cmdk (Ctrl+K search across modules)
- **Toast notifications:** Sonner

### 3D & Visuals
- **Three.js** — WebGL rendering for interactive 3D models
- **@react-three/fiber** (planned) — React-friendly Three.js wrappers
- 4 fully implemented 3D modules: Cell Explorer, Physics Lab, Chemistry Lab, DS Visualizer

### State & Data
- **Zustand** — global state for user session, XP, streak, recently viewed modules
- **Supabase** — PostgreSQL database + authentication backend
- **@google/generative-ai** — Gemini API integration for Nova AI tutor

### Dev Tooling
- **Monorepo:** Turborepo 2.0 + pnpm 9.7 workspaces
- **Build:** Turbo caching pipeline
- **Code quality:** Prettier, ESLint, TypeScript strict
- **ORM:** Prisma for type-safe DB queries

---

## 4. Architecture Decisions

### Why a Monorepo?
LearnVerse has two apps (`web` + `api`) and three shared packages (`ui`, `ai`, `types`). A monorepo with Turborepo keeps dependency versions consistent, enables atomic commits across layers, and lets the frontend import shared types directly without publishing a package.

### Why Next.js App Router over Pages Router?
- Server Components reduce JavaScript sent to the browser (better LCP)
- File-system routing with route groups `(auth)` and `(dashboard)` gives clean URL structure without path pollution
- Built-in `loading.tsx` and `error.tsx` per segment — no custom spinner logic needed
- Streaming responses from the AI chat improve perceived latency

### Why Zustand over Redux/Context?
The app needs a small, fast global store for user session state, XP, and recently viewed modules. Zustand requires zero boilerplate, no providers, and supports localStorage persistence natively — perfect for a learning platform that needs to survive browser refreshes without a complex state architecture.

### Why Three.js (raw) over react-three-fiber for now?
For the 3D visualizers, direct Three.js gives full control over geometry, materials, and raycasting (for click interactions on organelles). The `dynamic()` import in Next.js ensures Three.js is never rendered server-side, avoiding SSR hydration errors while keeping the main bundle lean.

### Why Glassmorphism as the design system?
A dark-first glass UI communicates **depth, modernity, and tech-forwardness** — important for a product targeting students who use Discord, Figma, and Notion daily. It also makes the 3D canvas visually cohesive with the rest of the page rather than looking like an embedded iframe.

---

## 5. Key Frontend Features Explained

### 🧊 3D Cell Explorer
- Full Three.js scene with labeled organelles (nucleus, mitochondria, Golgi, etc.)
- Click detection via raycasting — clicking an organelle opens an info panel
- "Ask Tutor" button on each organelle → dispatches a `CustomEvent` → auto-navigates to the AI chat tab with a pre-filled, context-aware question
- Lazy loaded with `dynamic({ ssr: false })` for zero SSR errors

### 🤖 Nova AI Tutor
- Chat UI with streaming feel (typing dots animation during Gemini API calls)
- Session memory (passing `session_id` between messages for context continuity)
- Suggested quick-question chips shown until first conversation
- Accessible via the AI Tutor tab in any module page

### 🎙️ Voice Chat
- Web Speech API (browser-native, no external STT dependency)
- Continuous mode — speaks answer via speechSynthesis after receiving AI response
- Fallback to text chat when microphone permission is denied

### 📝 Quiz Engine
- Timer bar with animated fill (`framer-motion`)
- Multiple choice and true/false question types
- Instant feedback (correct/incorrect + explanation) per question
- End-of-quiz summary with score, XP earned, and time taken

### 🏆 Gamification UI
- XP progress bar with animated level-up glow
- Achievement badge grid with locked/unlocked states
- Leaderboard list with "You" highlight
- Weekly activity bar chart (custom SVG, no chart library)

---

## 6. Pages & Routes

```
/                       → Landing page (hero, features, stats, testimonials, CTA)
/login                  → Email + password login
/register               → New account creation
/dashboard              → Main learner dashboard
/modules                → All available modules (grid)
/modules/[slug]         → Module detail (Learn | Simulate | AI Chat | Voice | Code tabs)
/quiz/[id]              → Quiz session for a module
```

All routes use the `(dashboard)` route group for sidebar + topbar layout injection without affecting URL structure.

---

## 7. Challenges & How They Were Solved

| Challenge | Solution |
|-----------|---------|
| Next.js blocked port 6000 (X11 reserved range) | Moved to port 6050, documented in `.env.example` |
| Three.js SSR crash in Next.js | `dynamic({ ssr: false })` on all 3D components |
| AI chat context lost between messages | Session ID stored in component state, passed with each request |
| Mobile sidebar not scrollable | Radix `ScrollArea` with custom scrollbar styling |
| Quiz state management complexity | Local component state (no store needed — quiz is self-contained) |
| Module cross-linking (3D click → AI chat) | Custom DOM events (`ask-nova`) to decouple components cleanly |

---

## 8. Design System & UI Principles

- **Dark-first** — all colors designed against `slate-950` background
- **Glassmorphism** — `backdrop-blur` + `bg-white/[0.03]` + `border-white/5` for all cards
- **Accent colors** — Indigo-to-purple gradient scale for CTAs and active states
- **Spacing rhythm** — 4px base, multiples of 4 for all padding/gaps (Tailwind default)
- **Typography** — Inter (system font via Tailwind), `font-semibold` for headings, `text-slate-400` for body copy
- **Accessibility** — Radix primitives with keyboard navigation, focus rings, ARIA labels

---

## 9. What's Next (Roadmap)

- [ ] react-three-fiber migration for more complex 3D scenes
- [ ] Multiplayer study rooms (Supabase Realtime)
- [ ] Certificate generation after completing a full module path
- [ ] Mobile app via React Native / Expo (shared types package)
- [ ] Voice input for quizzes
- [ ] Offline mode (PWA + IndexedDB for module content)

---

## 10. Running Locally

```bash
git clone https://github.com/kaithojukamalraju/learnverse.git
cd learnverse
pnpm install
cp .env.example .env    # fill in Supabase + Gemini keys
pnpm db:generate
pnpm db:push
pnpm dev
# → http://localhost:6050
```

---

*Submitted with ❤️ by [YOUR NAME] — Frontend Developer*
