"use client";

import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export function ChemistryLab() {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<() => void>(null!);
  const [ready, setReady] = useState(false);
  const [molecule, setMolecule] = useState("h2o");

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
      camera.position.set(0, 0, 3.5);
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

      function atom(color: number, pos: [number, number, number], r = 0.25) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.1 }));
        s.position.set(pos[0], pos[1], pos[2]);
        scene.add(s);
        return s;
      }

      function bond(a: [number, number, number], b: [number, number, number]) {
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
        const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
        cyl.position.set(mid[0], mid[1], mid[2]);
        cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
        scene.add(cyl);
      }

      while (scene.children.length > 2) scene.remove(scene.children[scene.children.length - 1]);

      if (molecule === "h2o") {
        atom(0xef4444, [0, 0.35, 0], 0.3);        // O
        atom(0xffffff, [-0.4, -0.2, 0], 0.2);     // H
        atom(0xffffff, [0.4, -0.2, 0], 0.2);      // H
        bond([0, 0.35, 0], [-0.4, -0.2, 0]);
        bond([0, 0.35, 0], [0.4, -0.2, 0]);
      } else if (molecule === "co2") {
        atom(0x6b7280, [0, 0, 0], 0.3);            // C
        atom(0xef4444, [-0.9, 0, 0], 0.25);        // O
        atom(0xef4444, [0.9, 0, 0], 0.25);         // O
        bond([-0.45, 0, 0], [-0.65, 0, 0]);
        bond([-0.25, 0, 0], [0.25, 0, 0]);
        bond([0.45, 0, 0], [0.65, 0, 0]);
      } else if (molecule === "nacl") {
        atom(0x6366f1, [-0.5, 0, 0], 0.35);        // Na
        atom(0x22c55e, [0.5, 0, 0], 0.3);          // Cl
        bond([-0.5, 0, 0], [0.5, 0, 0]);
      }

      setReady(true);

      let animId: number;
      function animate() {
        if (cancelled) return;
        animId = requestAnimationFrame(animate);
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
        ro.disconnect();
        controls.dispose();
        renderer.dispose();
        if (el!.contains(renderer.domElement)) el!.removeChild(renderer.domElement);
      };
    }

    init().catch((e) => console.error("ChemistryLab init error:", e));

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
  }, [molecule]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["h2o", "co2", "nacl"].map((m) => (
          <button
            key={m}
            onClick={() => setMolecule(m)}
            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${molecule === m ? "bg-brand-600 border-brand-500 text-white" : "bg-slate-900/60 border-white/5 text-slate-300 hover:border-white/10"}`}
          >
            {m === "h2o" ? "Water (H₂O)" : m === "co2" ? "CO₂" : "NaCl"}
          </button>
        ))}
      </div>
      <Card className="p-0 overflow-hidden bg-slate-950/40 border-white/5">
        <div ref={mountRef} className="h-[450px] relative">
          {!ready && <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading...</div>}
        </div>
      </Card>
    </div>
  );
}
