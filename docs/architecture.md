# LearnVerse Architecture

## Stack
- **Frontend:** Next.js 15 (App Router), TailwindCSS, Three.js (for 3D)
- **Backend:** Express.js, Prisma ORM
- **Database:** PostgreSQL (Neon/Supabase)
- **AI:** OpenAI GPT-4o / Google Gemini
- **Auth:** JWT (bcrypt + jsonwebtoken)
- **Monorepo:** Turborepo + pnpm

## Folder Layout
```
learnverse-ai/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   ├── ui/           # Shared UI components
│   ├── config/       # Shared configs
│   ├── types/        # TypeScript types
│   └── ai/           # AI prompt templates
├── db/               # SQL schema + migrations
└── public/           # Static assets (models, sounds, images)
```

## Data Flow
1. User interacts with Next.js frontend
2. Frontend calls Express API via fetch
3. API validates JWT, processes request
4. Prisma queries PostgreSQL
5. AI endpoints call OpenAI/Gemini
6. Response flows back to frontend

## Auth Flow
- Register/Login -> JWT token stored in localStorage
- Token sent in Authorization header
- Middleware validates on protected routes
- Optional auth for public endpoints
