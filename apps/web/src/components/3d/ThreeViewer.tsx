"use client";

import { useRef, useEffect } from "react";

interface ThreeViewerProps {
  children?: React.ReactNode;
  className?: string;
}

export function ThreeViewer({ className = "" }: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<() => void>(null!);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let cancelled = false;

    async function init() {
      const THREE = await (import("three") as any).then((m: any) => m.default || m);
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls" as any) as any;

      const w = el!.clientWidth || 600;
      const h = el!.clientHeight || 500;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 0, 5);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el!.appendChild(renderer.domElement);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;

      scene.add(new THREE.AmbientLight(0x404060, 0.5));
      const pl = new THREE.DirectionalLight(0xffffff, 1);
      pl.position.set(10, 10, 10);
      scene.add(pl);

      const starGeo = new THREE.BufferGeometry();
      const starCount = 1000;
      const positions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) positions[i] = (Math.random() - 0.5) * 200;
      starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);

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
        const h2 = el!.clientHeight || 500;
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

    init().catch((e) => console.error("ThreeViewer init error:", e));
    return () => { cancelled = true; cleanupRef.current?.(); };
  }, []);

  return <div ref={mountRef} className={`w-full h-[500px] rounded-xl overflow-hidden ${className}`} />;
}
