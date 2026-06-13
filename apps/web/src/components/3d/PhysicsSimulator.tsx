"use client";

import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export function PhysicsSimulator() {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<() => void>(null!);
  const [ready, setReady] = useState(false);
  const [gravity, setGravity] = useState(9.8);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let cancelled = false;

    async function init() {
      const THREE = await (import("three") as any).then((m: any) => m.default || m);
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls" as any) as any;

      const w = el!.clientWidth || 600;
      const h = el!.clientHeight || 400;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
      camera.position.set(4, 2, 4);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el!.appendChild(renderer.domElement);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      scene.add(new THREE.AmbientLight(0x404060, 0.5));
      const pl = new THREE.DirectionalLight(0xffffff, 1.5);
      pl.position.set(5, 5, 5);
      scene.add(pl);

      let time = 0, angle = Math.PI / 4;
      let pendulum: any;

      function buildPendulum(g: number) {
        while (scene.children.length > 1) scene.remove(scene.children[scene.children.length - 1]);
        const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: 0x6366f1, emissiveIntensity: 0.3 }));
        pivot.position.set(0, 1.8, 0);
        scene.add(pivot);
        const len = 1.5;
        const bob = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.2 }));
        bob.position.set(len * Math.sin(angle), 1.8 - len * Math.cos(angle), 0);
        scene.add(bob);
        const ropePoints = [
          new THREE.Vector3(0, 1.8, 0),
          new THREE.Vector3(bob.position.x, bob.position.y, 0)
        ];
        const rope = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ropePoints), new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
        scene.add(rope);
        const ground = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.1), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }));
        ground.position.set(0, -0.05, 0);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);
        pendulum = { bob, rope, pivot, len, g, angle };
      }

      buildPendulum(gravity);

      setReady(true);
      let animId: number;
      function animate() {
        if (cancelled) return;
        animId = requestAnimationFrame(animate);
        time += 0.016;
        if (pendulum) {
          const omega = Math.sqrt(pendulum.g / pendulum.len);
          pendulum.angle = (Math.PI / 4) * Math.cos(omega * time);
          pendulum.bob.position.x = pendulum.len * Math.sin(pendulum.angle);
          pendulum.bob.position.y = 1.8 - pendulum.len * Math.cos(pendulum.angle);
          const positions = pendulum.rope.geometry.attributes.position.array;
          positions[3] = pendulum.bob.position.x;
          positions[4] = pendulum.bob.position.y;
          pendulum.rope.geometry.attributes.position.needsUpdate = true;
        }
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

      const ro = new ResizeObserver(() => {
        const w2 = el!.clientWidth || 600;
        const h2 = el!.clientHeight || 400;
        camera.aspect = w2 / h2;
        camera.updateProjectionMatrix();
        renderer.setSize(w2, h2);
      });
      ro.observe(el!);

      cleanupRef.current = () => {
        cancelled = true;
        cancelAnimationFrame(animId);
        ro.disconnect(); controls.dispose(); renderer.dispose();
        if (el!.contains(renderer.domElement)) el!.removeChild(renderer.domElement);
      };
    }

    init().catch((e) => console.error("PhysicsSimulator init error:", e));
    return () => { cancelled = true; cleanupRef.current?.(); };
  }, [gravity]);

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden bg-slate-950/40 border-white/5">
        <div ref={mountRef} className="h-[450px] relative">
          {!ready && <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading...</div>}
        </div>
      </Card>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-400">Gravity:</span>
        <input type="range" min="1" max="20" step="0.1" value={gravity} onChange={(e) => setGravity(parseFloat(e.target.value))} className="w-32" />
        <span className="text-slate-300 font-mono">{gravity.toFixed(1)} m/s²</span>
      </div>
    </div>
  );
}
