"use client";

import { useRef, useEffect } from "react";

export function Hero3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let lastFrame = 0;
    let visible = true;

    // Stop when tab hidden or scrolled out of view
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(canvas);
    const onVisibility = () => { if (document.hidden) visible = false; else visible = true; };
    document.addEventListener("visibilitychange", onVisibility);

    const dpr = window.devicePixelRatio || 1;
    const W = 600, H = 500;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const particleCount = 50;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 2 + 0.5, alpha: Math.random() * 0.4 + 0.15,
    }));

    function draw(now: number) {
      if (!visible) { animationId = requestAnimationFrame(draw); return; }
      if (!ctx) return;
      // Cap at 30fps to reduce CPU
      if (now - lastFrame < 33) { animationId = requestAnimationFrame(draw); return; }
      lastFrame = now;

      time += 0.01;
      ctx.clearRect(0, 0, W, H);

      // Gradient bg — only create once per 10 frames
      if (Math.floor(time * 10) % 10 === 0) {
        const grad = ctx.createRadialGradient(300, 250, 50, 300, 250, 300);
        grad.addColorStop(0, "rgba(99,102,241,0.08)");
        grad.addColorStop(0.5, "rgba(139,92,246,0.04)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // Torus knot (simplified — single pass)
      ctx.save();
      ctx.translate(300, 250);
      ctx.rotate(time * 0.4);

      ctx.beginPath();
      for (let i = 0; i <= 30; i++) {
        const t = (i / 30) * Math.PI * 2;
        const r = 90 + 25 * Math.sin(t * 3);
        const x = r * Math.cos(t + time * 0.25);
        const y = r * Math.sin(t + time * 0.25);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(129,140,248,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      for (let i = 0; i <= 30; i++) {
        const t = (i / 30) * Math.PI * 2;
        const r = 55 + 15 * Math.sin(t * 3 + 0.5);
        const x = r * Math.cos(t - time * 0.15);
        const y = r * Math.sin(t - time * 0.15);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(167,139,250,0.25)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();

      // Particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }

      // Batch particle draw
      ctx.beginPath();
      for (const p of particles) {
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fillStyle = "rgba(129,140,248,0.4)";
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    }

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="h-[380px] sm:h-[450px] lg:h-[520px] w-full rounded-2xl bg-gradient-to-b from-indigo-950/10 to-indigo-900/5 border border-white/5 shadow-2xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <span className="text-[10px] text-brand-400 font-mono tracking-widest uppercase bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded">
          Live Preview
        </span>
      </div>
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
