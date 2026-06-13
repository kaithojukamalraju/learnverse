"use client";

import Link from "next/link";
import { Hero3DCanvas } from "./hero-canvas";
import { Sparkles, Brain, Compass, BookOpen, Shield, ChevronRight } from "lucide-react";

const features = [
  { icon: Brain, title: "AI-Powered Tutor", desc: "Meet Nova, your personal AI learning assistant powered by Gemini AI. Get instant explanations and adaptive guidance." },
  { icon: Compass, title: "Interactive 3D Simulations", desc: "Explore complex concepts through immersive 3D models, simulations, and interactive experiments." },
  { icon: BookOpen, title: "Adaptive Learning Paths", desc: "Personalized curriculum that adapts to your skill level, learning pace, and knowledge gaps." },
  { icon: Shield, title: "Gamified Achievement System", desc: "Earn XP, unlock achievements, climb leaderboards, and track your learning streak." },
];

const testimonials = [
  { name: "Dr. Sarah Chen", role: "Physics Professor", text: "LearnVerse AI has transformed how my students engage with complex physics concepts. The 3D simulations are incredible." },
  { name: "James Rodriguez", role: "Self-Learner", desc: "Computer Science", text: "The AI tutor adapts to my pace perfectly. I've progressed faster than in any traditional course." },
  { name: "Emily Watson", role: "High School Student", text: "Learning with 3D models makes everything click. It feels like a game, not studying!" },
];

export default function LandingPage() {
  return (
    <div className="w-full min-h-screen bg-slate-950 text-white overflow-x-hidden relative">
      {/* Gradient Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[150px]" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              LearnVerse AI
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors font-medium">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10">
        <main className="max-w-6xl mx-auto px-6 pt-16 pb-12 lg:pt-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Block - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-500/20">
                <Brain className="w-3.5 h-3.5" />
                Powered by Gemini AI
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  Learn Anything.
                  <br />
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Instantly.
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
                  Experience the future of education with AI-powered tutoring, interactive 3D simulations, and adaptive learning paths tailored just for you.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all font-medium shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]">
                  Start Learning Free
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/modules" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-all font-medium text-slate-300 hover:text-white hover:bg-white/5">
                  Explore Modules
                </Link>
              </div>
            </div>

            {/* Right Block - 3D Canvas (client-side only) */}
            <Hero3DCanvas />
          </div>
        </main>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything you need to learn
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              AI-powered tools and interactive experiences designed for modern learners.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => (
              <div key={feature.title} className="group relative p-6 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 py-14 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "Active Learners" },
              { value: "100+", label: "Interactive Lessons" },
              { value: "50+", label: "3D Simulations" },
              { value: "98%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Loved by learners</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Hear what our community has to say about their learning journey.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-xl bg-white/[0.03] border border-white/5">
                <p className="text-sm text-slate-400 leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl mx-auto">Ready to transform your learning journey?</h2>
          <p className="text-slate-400 max-w-md mx-auto">Join thousands of learners already using LearnVerse AI to master new skills.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all font-medium shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]">
            Get Started Free
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 mt-12 bg-slate-950/40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 LearnVerse AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/api/docs" className="hover:text-slate-300 transition-colors">API</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
