# 🎓 LearnVerse AI

> An AI-powered interactive learning platform with 3D visualizations, voice AI, quizzes, and gamification — built as a modern monorepo.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://typescript.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.0-bf70ff?style=flat-square&logo=turborepo)](https://turbo.build)
[![pnpm](https://img.shields.io/badge/pnpm-9.7-f6923e?style=flat-square&logo=pnpm)](https://pnpm.io)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Tutor** | Chat with a Gemini-powered AI tutor for instant help on any topic |
| 🎙️ **Voice Chat** | Speak naturally to the AI — hands-free learning |
| 🧊 **3D Visualizations** | Interactive Three.js models for cells, physics, data structures & more |
| 📝 **Smart Quizzes** | Timed, adaptive quizzes with instant AI-generated explanations |
| 🏆 **Gamification** | XP, streaks, achievement badges, and global leaderboards |
| 📊 **Progress Tracking** | Visual charts showing your learning journey |
| 🎯 **AI Recommendations** | Personalized learning paths powered by AI |
| 🔐 **Auth** | Secure JWT-based authentication with Supabase |

---

## 🏗️ Architecture

```
learnverse-ai/
├── apps/
│   ├── web/          # Next.js 15 frontend (App Router)
│   └── api/          # Express.js backend + Prisma ORM
├── packages/
│   ├── ai/           # AI prompt templates & integrations
│   ├── db/           # Prisma schema & migrations
│   ├── types/        # Shared TypeScript types
│   ├── ui/           # Shared UI component library
│   └── config/       # Shared configs (eslint, ts, tailwind)
├── db/               # SQL schema
├── docs/             # Architecture & API docs
└── public/           # Static assets (3D models, sounds, images)
```

### Tech Stack

- **Frontend:** Next.js 15 · React 18 · TailwindCSS · Framer Motion · Three.js · Zustand
- **Backend:** Express.js · Prisma ORM · JWT Auth
- **AI:** Google Gemini · @google/generative-ai
- **Database:** PostgreSQL (Supabase)
- **Monorepo:** Turborepo · pnpm workspaces

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [pnpm](https://pnpm.io) ≥ 9.7.0 (`npm i -g pnpm`)
- A [Supabase](https://supabase.com) project (for PostgreSQL + Auth)
- A [Google AI Studio](https://aistudio.google.com) API key (for Gemini)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/kaithojukamalraju/learnverse.git
cd learnverse

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example .env
# Fill in your Supabase URL, anon key, and Gemini API key

# 4. Set up the database
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema to database
pnpm db:seed       # Seed sample learning modules

# 5. Start the dev server
pnpm dev
```

The app will be available at **http://localhost:6050**

---

## ⚙️ Configuration

### Environment Variables (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `GEMINI_API_KEY` | ⚠️ | Google Gemini key (optional — falls back to local AI) |
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string (pooler) |
| `DIRECT_URL` | ✅ | Direct PostgreSQL connection string |

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Next.js + Express) |
| `pnpm build` | Production build of all packages |
| `pnpm lint` | Run ESLint across the monorepo |
| `pnpm format` | Format code with Prettier |
| `pnpm db:push` | Push Prisma schema to database |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:seed` | Seed the database with sample data |

---

## 🗄️ Database Schema

Key models (via Prisma):

```
User          → id, email, name, password, xp, streak, createdAt
Module        → id, title, slug, description, difficulty, category
Lesson        → id, moduleId, title, content, order, mediaUrl
Quiz          → id, moduleId, title, timeLimit
Question      → id, quizId, text, options[], correctAnswer, explanation
Progress      → id, userId, lessonId, completedAt
UserQuizAttempt → id, userId, quizId, score, answers[], completedAt
Achievement   → id, userId, badge, unlockedAt
```

---

## 🤝 Contributing

1. Fork the repo on [GitHub](https://github.com/kaithojukamalraju/learnverse)
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is for educational purposes. All rights reserved by the author.

---

<p align="center">
  Made with ❤️ and <strong>AI</strong> · Built by <a href="https://github.com/kaithojukamalraju">Kaithojuk Kamalraju</a>
</p>
