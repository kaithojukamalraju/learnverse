"use client";

import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DSVisualizer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<() => void>(null!);
  const [ready, setReady] = useState(false);
  const [dsType, setDsType] = useState("array");

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
      camera.position.set(4, 3, 5);
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

      function buildArray() {
        while (scene.children.length > 2) scene.remove(scene.children[scene.children.length - 1]);
        const data = [3, 7, 1, 9, 4, 6, 8, 2, 5];
        const colors = [0x6366f1, 0x22c55e, 0xeab308, 0xf43f5e, 0xa855f7, 0x3b82f6, 0xec4899, 0x14b8a6, 0xf97316];
        data.forEach((val: number, i: number) => {
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: colors[i % colors.length], emissive: colors[i % colors.length], emissiveIntensity: 0.1 }));
          box.position.set(i * 0.8 - 3.2, 0, 0);
          scene.add(box);
        });
      }

      function buildLinkedList() {
        while (scene.children.length > 2) scene.remove(scene.children[scene.children.length - 1]);
        const data = [5, 3, 8, 1, 9];
        data.forEach((val: number, i: number) => {
          const box = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: 0x6366f1, emissiveIntensity: 0.15 }));
          box.position.set(i * 1.2 - 2.4, 0, 0);
          scene.add(box);
          if (i < data.length - 1) {
            const points = [new THREE.Vector3(i * 1.2 - 2.0, 0, 0), new THREE.Vector3((i + 1) * 1.2 - 2.8, 0, 0)];
            const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
            scene.add(line);
          }
        });
      }

      function buildGraph() {
        while (scene.children.length > 2) scene.remove(scene.children[scene.children.length - 1]);
        const nodes = [[-2, 0, 0], [0, 1.5, 0], [0, -1.5, 0], [2, 0, 1], [2, 0, -1]];
        const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 3], [2, 4]];
        edges.forEach(([a, b]: number[]) => {
          const pts = [new THREE.Vector3(nodes[a][0], nodes[a][1], nodes[a][2]), new THREE.Vector3(nodes[b][0], nodes[b][1], nodes[b][2])];
          scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x4a5568 })));
        });
        nodes.forEach((n, i) => {
          const s = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshStandardMaterial({ color: i === 0 ? 0x22c55e : 0x6366f1, emissive: 0x6366f1, emissiveIntensity: 0.15 }));
          s.position.set(n[0], n[1], n[2]);
          scene.add(s);
        });
      }

      function buildHashTable() {
        while (scene.children.length > 2) scene.remove(scene.children[scene.children.length - 1]);
        for (let i = 0; i < 9; i++) {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.5), new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: 0x6366f1, emissiveIntensity: 0.1, transparent: true, opacity: 0.7 }));
          box.position.set(col * 0.8 - 0.8, row * 0.7 - 0.35, 0);
          scene.add(box);
        }
      }

      const builders: Record<string, () => void> = { array: buildArray, linkedList: buildLinkedList, graph: buildGraph, hashTable: buildHashTable };
      builders[dsType]?.();

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
        ro.disconnect(); controls.dispose(); renderer.dispose();
        if (el!.contains(renderer.domElement)) el!.removeChild(renderer.domElement);
      };
    }

    init().catch((e) => console.error("DSVisualizer init error:", e));
    return () => { cancelled = true; cleanupRef.current?.(); };
  }, [dsType]);

  return (
    <div className="space-y-4">
      <Tabs value={dsType} onValueChange={setDsType}>
        <TabsList>
          <TabsTrigger value="array">Array</TabsTrigger>
          <TabsTrigger value="linkedList">Linked List</TabsTrigger>
          <TabsTrigger value="graph">Graph</TabsTrigger>
          <TabsTrigger value="hashTable">Hash Table</TabsTrigger>
        </TabsList>
      </Tabs>
      <Card className="p-0 overflow-hidden bg-slate-950/40 border-white/5">
        <div ref={mountRef} className="h-[450px] relative">
          {!ready && <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading...</div>}
        </div>
      </Card>
    </div>
  );
}
