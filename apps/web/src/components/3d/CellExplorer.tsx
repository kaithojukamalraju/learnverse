"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Info, ZoomIn } from "lucide-react";

const organelles = [
  { id: "nucleus", label: "Nucleus", color: "#6366f1", position: [0, 0, 0], desc: "Contains DNA and controls cell activities. It is the control center of the cell." },
  { id: "mitochondria", label: "Mitochondria", color: "#22c55e", position: [1.1, 0.6, 0.4], desc: "Powerhouse of the cell, produces ATP energy through cellular respiration." },
  { id: "ribosome", label: "Ribosome", color: "#eab308", position: [-0.9, 0.6, 0.8], desc: "Protein synthesis factory. Translates RNA code into polypeptide chains." },
  { id: "golgi", label: "Golgi Body", color: "#a855f7", position: [-0.8, -0.6, 0.5], desc: "Modifies, sorts, and packages proteins for secretion or delivery." },
  { id: "er", label: "Endoplasmic Reticulum", color: "#3b82f6", position: [0.6, -0.7, -0.4], desc: "Synthesizes lipids, metabolizes carbs, and folds newly formed proteins." },
];

interface CellExplorerProps {
  onAskTutor?: (topic: string) => void;
}

export function CellExplorer({ onAskTutor }: CellExplorerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<() => void>(null!);
  const [selected, setSelected] = useState<typeof organelles[0] | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let cancelled = false;
    let THREE: any, scene: any, camera: any, renderer: any, controls: any;
    let animId: number;
    let meshes: Record<string, { mesh: any; originalColor: string }[]> = {};

    async function init() {
      const m = await import("three") as any;
      THREE = m.default || m;
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls" as any);

      const w = el!.clientWidth || 600;
      const h = el!.clientHeight || 400;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 0, 4.5);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el!.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.maxDistance = 7;
      controls.minDistance = 1.5;

      scene.add(new THREE.AmbientLight(0x404060, 0.5));
      const pl1 = new THREE.DirectionalLight(0xffffff, 1.5);
      pl1.position.set(10, 10, 10);
      scene.add(pl1);
      const pl2 = new THREE.DirectionalLight(0x8888ff, 0.5);
      pl2.position.set(-10, -10, -10);
      scene.add(pl2);

      // Cell membrane (outer wireframe)
      const membraneGeo = new THREE.SphereGeometry(2.0, 32, 32);
      const membraneMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.12, wireframe: true, depthWrite: false });
      scene.add(new THREE.Mesh(membraneGeo, membraneMat));

      // Organelles
      function makeSphere(color: number, radius: number, pos: [number, number, number], emissive = 0, wireframe = false) {
        const geo = new THREE.SphereGeometry(radius, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 0.05, wireframe });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos[0], pos[1], pos[2]);
        scene.add(mesh);
        return mesh;
      }

      function makeCapsule(color: number, pos: [number, number, number], rotation: [number, number, number]) {
        const group = new THREE.Group();
        group.position.set(pos[0], pos[1], pos[2]);
        group.rotation.set(rotation[0], rotation[1], rotation[2]);

        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.55, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.2 }));
        group.add(cyl);

        const cap1 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.2 }));
        cap1.position.set(0, 0.275, 0);
        group.add(cap1);
        const cap2 = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.2 }));
        cap2.position.set(0, -0.275, 0);
        group.add(cap2);

        scene.add(group);
        return group;
      }

      function makeTorus(color: number, pos: [number, number, number], radius: number, tube: number, arc: number) {
        const geo = new THREE.TorusGeometry(radius, tube, 8, 24, arc);
        const mat = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos[0], pos[1], pos[2]);
        scene.add(mesh);
        return mesh;
      }

      function makeBox(color: number, pos: [number, number, number], size: [number, number, number]) {
        const geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
        const mat = new THREE.MeshStandardMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos[0], pos[1], pos[2]);
        scene.add(mesh);
        return mesh;
      }

      // Nucleus
      const nucleusGroup = new THREE.Group();
      nucleusGroup.position.set(0, 0, 0);
      const nucleolus = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0xf43f5e, emissiveIntensity: 0.2 }));
      nucleusGroup.add(nucleolus);
      const nucEnv = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 32), new THREE.MeshStandardMaterial({ color: 0x6366f1, transparent: true, opacity: 0.25 }));
      nucleusGroup.add(nucEnv);
      scene.add(nucleusGroup);
      meshes["nucleus"] = [{ mesh: nucleusGroup, originalColor: "#6366f1" }];

      // Mitochondria
      const mitoGroup = makeCapsule(0x22c55e, [1.1, 0.6, 0.4], [0.3, 0.5, 0.8]);
      meshes["mitochondria"] = [{ mesh: mitoGroup, originalColor: "#22c55e" }];

      // Golgi
      const golgiGroup = new THREE.Group();
      golgiGroup.position.set(-0.8, -0.6, 0.5);
      golgiGroup.rotation.set(0.2, 0.4, 0.8);
      golgiGroup.add(makeTorus(0xa855f7, [0, 0, 0], 0.35, 0.04, Math.PI / 1.5));
      const g2 = makeTorus(0xa855f7, [0, 0, 0], 0.25, 0.04, Math.PI / 1.5);
      g2.position.set(0.08, 0.04, 0);
      golgiGroup.add(g2);
      const g3 = makeTorus(0xa855f7, [0, 0, 0], 0.15, 0.04, Math.PI / 1.5);
      g3.position.set(0.16, 0.08, 0);
      golgiGroup.add(g3);
      scene.add(golgiGroup);
      meshes["golgi"] = [{ mesh: golgiGroup, originalColor: "#a855f7" }];

      // ER
      const erGroup = new THREE.Group();
      erGroup.position.set(0.6, -0.7, -0.4);
      erGroup.rotation.set(0.4, 0.2, -0.5);
      erGroup.add(makeBox(0x3b82f6, [0, 0, 0], [0.4, 0.08, 0.55]));
      const er2 = makeBox(0x3b82f6, [0, 0, 0], [0.3, 0.08, 0.5]);
      er2.position.set(0.05, 0.12, 0.05);
      erGroup.add(er2);
      scene.add(erGroup);
      meshes["er"] = [{ mesh: erGroup, originalColor: "#3b82f6" }];

      // Ribosomes
      const riboPositions = [[-0.8, 0.6, 0.8], [-1.0, 0.4, 0.9], [-0.6, 0.8, 0.7], [-1.2, 0.7, 0.5], [0.4, -0.4, 0.8], [0.5, -0.55, 0.9]];
      const riboGroup = new THREE.Group();
      for (const pos of riboPositions) {
        const r = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0xeab308, emissiveIntensity: 0.1 }));
        r.position.set(pos[0], pos[1], pos[2]);
        riboGroup.add(r);
      }
      scene.add(riboGroup);
      meshes["ribosome"] = [{ mesh: riboGroup, originalColor: "#eab308" }];

      // Click detection
      const clickables: any[] = [nucleusGroup, mitoGroup, golgiGroup, erGroup, riboGroup];
      const clickableIdMap: Record<string, any> = { nucleus: nucleusGroup, mitochondria: mitoGroup, golgi: golgiGroup, er: erGroup, ribosome: riboGroup };
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      renderer.domElement.addEventListener("click", (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickables, true);
        if (intersects.length > 0) {
          let hit = intersects[0].object;
          while (hit.parent && !clickables.includes(hit)) hit = hit.parent;
          for (const [id, obj] of Object.entries(clickableIdMap)) {
            if (hit === obj || obj.children.includes(hit)) {
              const org = organelles.find((o) => o.id === id);
              if (org) { setSelected(org); setHoveredId(null); }
              break;
            }
          }
        }
      });

      renderer.domElement.addEventListener("mousemove", (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickables, true);
        let found: string | null = null;
        if (intersects.length > 0) {
          let hit = intersects[0].object;
          while (hit.parent && !clickables.includes(hit)) hit = hit.parent;
          for (const [id, obj] of Object.entries(clickableIdMap)) {
            if (hit === obj || obj.children.includes(hit)) { found = id; break; }
          }
        }
        setHoveredId(found);
        renderer.domElement.style.cursor = found ? "pointer" : "grab";
      });

      setReady(true);

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

    init().catch((e) => { console.error("CellExplorer init error:", e); });
    return () => { cancelled = true; cleanupRef.current?.(); };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        <Card className="p-0 overflow-hidden bg-slate-950/40 border-white/5">
          <div className="absolute top-2 left-4 z-10 text-[10px] text-slate-500 uppercase tracking-widest pointer-events-none">
            3D Cell Model
          </div>
          <div ref={mountRef} className="h-[450px] relative">
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm animate-pulse">
                Loading 3D scene...
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="p-5 space-y-4 bg-slate-900/60 border-white/5 text-white flex flex-col h-[450px] justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-base flex items-center gap-1.5 text-brand-300">
                <Info className="w-4 h-4" /> Cell Explorer
              </h3>
              <p className="text-xs text-slate-400">Click on any organelle inside the 3D cell to inspect it</p>
            </div>

            {selected ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: selected.color }} />
                  <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider">{selected.label}</Badge>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">{selected.desc}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 italic mb-2">Or select from the list:</p>
                {organelles.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => setSelected(org)}
                    className="w-full text-left flex items-center justify-between p-2 rounded-lg bg-slate-950/20 hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: org.color }} />
                      <span className="font-medium">{org.label}</span>
                    </div>
                    <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {selected && onAskTutor && (
            <Button
              className="w-full text-xs font-medium bg-brand-600 hover:bg-brand-700 text-white"
              onClick={() => onAskTutor(selected.label)}
            >
              <Brain className="w-4 h-4 mr-2" /> Ask Nova about {selected.label}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
