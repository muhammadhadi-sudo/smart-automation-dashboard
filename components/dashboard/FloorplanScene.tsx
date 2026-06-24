"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { rooms, relays, sensors, wallSegments, OX, OZ } from "@/lib/data";
import { Relay, Sensor } from "@/lib/types";
import { showToast } from "./ToastContainer";

interface FloorplanSceneProps {
  onRelayToggle: (id: string) => void;
}

/* Tipe untuk menyimpan referensi visual relay */
interface RelayVisual {
  group: THREE.Group;
  base: THREE.Mesh;
  baseMat: THREE.MeshStandardMaterial;
  sph: THREE.Mesh;
  sphMat: THREE.MeshStandardMaterial;
  ring: THREE.Mesh;
  ringMat: THREE.MeshBasicMaterial;
  pLight: THREE.PointLight | null;
}

/* Tipe untuk menyimpan referensi visual sensor */
interface SensorVisual {
  group: THREE.Group;
  diam: THREE.Mesh;
  diamMat: THREE.MeshStandardMaterial;
  glow: THREE.Mesh;
  glowMat: THREE.MeshBasicMaterial;
}

export default function FloorplanScene({ onRelayToggle }: FloorplanSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  /* Simpan di ref agar tidak hilang saat re-render */
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    clock: THREE.Clock;
    relayVisuals: Record<string, RelayVisual>;
    sensorVisuals: Record<string, SensorVisual>;
    allClickable: THREE.Mesh[];
    labelEls: Record<string, HTMLDivElement>;
    mouseDown: { x: number; y: number };
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    animId: number;
  } | null>(null);

  /* ---- Tekstur grid untuk lantai ---- */
  const makeGridTexture = useCallback(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#151d19";
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "#1f2e26";
    ctx.lineWidth = 1;
    const step = 512 / 14;
    for (let i = 0; i <= 14; i++) {
      ctx.beginPath();
      ctx.moveTo(i * step, 0);
      ctx.lineTo(i * step, 512);
      ctx.stroke();
    }
    for (let i = 0; i <= 9; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * step);
      ctx.lineTo(512, i * step);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  /* ---- Bangun floorplan ---- */
  const buildFloorplan = useCallback(
    (scene: THREE.Scene) => {
      /* Lantai utama dengan grid */
      const floorGeo = new THREE.PlaneGeometry(14, 9);
      const floorMat = new THREE.MeshStandardMaterial({
        map: makeGridTexture(),
        roughness: 0.9,
      });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(OX, -0.01, OZ);
      scene.add(floor);

      /* Lantai per ruangan (warna sedikit berbeda) */
      const roomColors = [0x182420, 0x1a2622, 0x151c18, 0x1c2824, 0x182220, 0x151c18];
      rooms.forEach((r, i) => {
        const geo = new THREE.PlaneGeometry(r.w - 0.15, r.d - 0.15);
        const mat = new THREE.MeshStandardMaterial({ color: roomColors[i], roughness: 0.85 });
        const m = new THREE.Mesh(geo, mat);
        m.rotation.x = -Math.PI / 2;
        m.position.set(r.x + r.w / 2 + OX, 0.005, r.z + r.d / 2 + OZ);
        scene.add(m);
      });

      /* Dinding */
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x3a4e42,
        roughness: 0.65,
        transparent: true,
        opacity: 0.88,
      });
      const wallH = 1.6;
      wallSegments.forEach(([x1, z1, x2, z2]) => {
        const isH = z1 === z2;
        const len = isH ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
        if (len < 0.01) return;
        const geo = new THREE.BoxGeometry(isH ? len : 0.1, wallH, isH ? 0.1 : len);
        const w = new THREE.Mesh(geo, wallMat);
        w.position.set((x1 + x2) / 2 + OX, wallH / 2, (z1 + z2) / 2 + OZ);
        scene.add(w);
      });

      /* ---- Furnitur sederhana ---- */
      const furA = new THREE.MeshStandardMaterial({ color: 0x222e28, roughness: 0.8 });
      const furB = new THREE.MeshStandardMaterial({ color: 0x2a3630, roughness: 0.75 });

      /* Sofa */
      const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 0.8), furB);
      sofa.position.set(2.5 + OX, 0.2, 3.8 + OZ);
      scene.add(sofa);
      const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.15), furA);
      sofaBack.position.set(2.5 + OX, 0.45, 4.25 + OZ);
      scene.add(sofaBack);

      /* Meja tamu */
      const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.7), furB);
      table.position.set(2.5 + OX, 0.175, 2.5 + OZ);
      scene.add(table);

      /* Tempat tidur */
      const bed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 2.2), furA);
      bed.position.set(7 + OX, 0.175, 3 + OZ);
      scene.add(bed);
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.4), furB);
      pillow.position.set(7 + OX, 0.42, 4 + OZ);
      scene.add(pillow);

      /* Meja dapur */
      const counter = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 0.9), furB);
      counter.position.set(2.5 + OX, 0.4, 7.5 + OZ);
      scene.add(counter);

      /* Mobil di garasi */
      const carMat = new THREE.MeshStandardMaterial({ color: 0x2a3832, roughness: 0.5 });
      const carBody = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 1.6), carMat);
      carBody.position.set(11.5 + OX, 0.35, 2.5 + OZ);
      scene.add(carBody);
      const carTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 1.4), carMat);
      carTop.position.set(11.2 + OX, 0.8, 2.5 + OZ);
      scene.add(carTop);

      /* Bak mandi */
      const tub = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.8), furA);
      tub.position.set(7 + OX, 0.25, 8.2 + OZ);
      scene.add(tub);

      /* Rak gudang */
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 0.5), furB);
      shelf.position.set(11.5 + OX, 0.75, 8.3 + OZ);
      scene.add(shelf);
    },
    [makeGridTexture]
  );

  /* ---- Buat marker relay ---- */
  const buildRelayMarkers = useCallback(
    (scene: THREE.Scene, allClickable: THREE.Mesh[], relayVisuals: Record<string, RelayVisual>) => {
      relays.forEach((r: Relay) => {
        const g = new THREE.Group();

        /* Base lingkaran */
        const baseMat = new THREE.MeshStandardMaterial({
          color: r.state ? 0x00e676 : 0x2a3530,
          emissive: r.state ? 0x00e676 : 0x000000,
          emissiveIntensity: r.state ? 0.6 : 0,
          roughness: 0.4,
        });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 32), baseMat);
        g.add(base);

        /* Bola indikator */
        const sphMat = new THREE.MeshStandardMaterial({
          color: r.state ? 0x00e676 : 0x4a5a50,
          emissive: r.state ? 0x00e676 : 0x000000,
          emissiveIntensity: r.state ? 1.0 : 0,
        });
        const sph = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), sphMat);
        sph.position.y = 0.18;
        g.add(sph);

        /* Cincin pulse */
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x00e676,
          transparent: true,
          opacity: r.state ? 0.35 : 0,
          side: THREE.DoubleSide,
        });
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.42, 32), ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.04;
        g.add(ring);

        /* Point light */
        let pLight: THREE.PointLight | null = null;
        if (r.state) {
          pLight = new THREE.PointLight(0x00e676, 0.4, 4);
          pLight.position.y = 0.5;
          g.add(pLight);
        }

        g.position.set(r.x + OX, 0.04, r.z + OZ);
        g.userData = { type: "relay", id: r.id };
        scene.add(g);

        relayVisuals[r.id] = { group: g, base, baseMat, sph, sphMat, ring, ringMat, pLight };
        g.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) allClickable.push(c as THREE.Mesh);
        });
      });
    },
    []
  );

  /* ---- Buat marker sensor ---- */
  const buildSensorMarkers = useCallback(
    (scene: THREE.Scene, allClickable: THREE.Mesh[], sensorVisuals: Record<string, SensorVisual>) => {
      sensors.forEach((s: Sensor) => {
        const g = new THREE.Group();

        /* Tiang */
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.55, 8),
          new THREE.MeshStandardMaterial({ color: 0x5a6a60 })
        );
        pole.position.y = 0.275;
        g.add(pole);

        /* Diamond */
        const diamMat = new THREE.MeshStandardMaterial({
          color: 0xff9100,
          emissive: 0xff9100,
          emissiveIntensity: 0.4,
          transparent: true,
          opacity: 0.85,
        });
        const diam = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), diamMat);
        diam.position.y = 0.65;
        g.add(diam);

        /* Glow ring */
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0xff9100,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
        });
        const glow = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.35, 32), glowMat);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = 0.04;
        g.add(glow);

        g.position.set(s.x + OX, 0, s.z + OZ);
        g.userData = { type: "sensor", id: s.id };
        scene.add(g);

        sensorVisuals[s.id] = { group: g, diam, diamMat, glow, glowMat };
        g.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) allClickable.push(c as THREE.Mesh);
        });
      });
    },
    []
  );

  /* ---- Update visual relay ---- */
  const updateRelayVisual = useCallback(
    (id: string) => {
      const r = relays.find((r) => r.id === id);
      const v = sceneRef.current?.relayVisuals[id];
      if (!r || !v) return;
      const on = r.state;

      v.baseMat.color.setHex(on ? 0x00e676 : 0x2a3530);
      v.baseMat.emissive.setHex(on ? 0x00e676 : 0x000000);
      v.baseMat.emissiveIntensity = on ? 0.6 : 0;
      v.sphMat.color.setHex(on ? 0x00e676 : 0x4a5a50);
      v.sphMat.emissive.setHex(on ? 0x00e676 : 0x000000);
      v.sphMat.emissiveIntensity = on ? 1.0 : 0;
      v.ringMat.opacity = on ? 0.35 : 0;

      if (on && !v.pLight) {
        v.pLight = new THREE.PointLight(0x00e676, 0.4, 4);
        v.pLight.position.y = 0.5;
        v.group.add(v.pLight);
      } else if (!on && v.pLight) {
        v.group.remove(v.pLight);
        v.pLight.dispose();
        v.pLight = null;
      }
    },
    []
  );

  /* Expose updateRelayVisual ke parent */
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, (id: string) => void>).__updateRelayVisual = updateRelayVisual;
    }
  }, [updateRelayVisual]);

  /* ---- Inisialisasi scene ---- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    /* Scene */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b100e);
    scene.fog = new THREE.FogExp2(0x0b100e, 0.018);

    /* Kamera */
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(2, 20, 16);

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.insertBefore(renderer.domElement, container.firstChild);

    /* Controls */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI / 2.3;
    controls.minDistance = 8;
    controls.maxDistance = 35;
    controls.update();

    /* Pencahayaan */
    scene.add(new THREE.AmbientLight(0xc8e0d0, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(8, 15, 10);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0x80c0a0, 0.2);
    dirLight2.position.set(-6, 10, -8);
    scene.add(dirLight2);

    /* Bangun floorplan */
    buildFloorplan(scene);

    /* Marker relay & sensor */
    const allClickable: THREE.Mesh[] = [];
    const relayVisuals: Record<string, RelayVisual> = {};
    const sensorVisuals: Record<string, SensorVisual> = {};
    buildRelayMarkers(scene, allClickable, relayVisuals);
    buildSensorMarkers(scene, allClickable, sensorVisuals);

    /* Label ruangan */
    const labelEls: Record<string, HTMLDivElement> = {};
    const labelContainer = labelContainerRef.current;
    if (labelContainer) {
      rooms.forEach((r) => {
        const el = document.createElement("div");
        el.className = "room-label";
        el.textContent = r.name;
        labelContainer.appendChild(el);
        labelEls[r.name] = el;
      });
    }

    /* Simpan ke ref */
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    sceneRef.current = {
      scene, camera, renderer, controls, clock,
      relayVisuals, sensorVisuals, allClickable,
      labelEls, mouseDown: { x: 0, y: 0 },
      raycaster, mouse, animId: 0,
    };

    /* ---- Animasi loop ---- */
    const animate = () => {
      sceneRef.current!.animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      controls.update();

      /* Rotasi & melayang sensor diamond */
      Object.values(sensorVisuals).forEach((v) => {
        v.diam.rotation.y = t * 1.2;
        v.diam.rotation.x = Math.sin(t * 0.8) * 0.3;
        v.diam.position.y = 0.65 + Math.sin(t * 1.5) * 0.05;
        v.glowMat.opacity = 0.1 + Math.sin(t * 2) * 0.06;
      });

      /* Pulse ring relay aktif */
      relays.forEach((r) => {
        if (!r.state) return;
        const v = relayVisuals[r.id];
        if (!v) return;
        const scale = 1 + Math.sin(t * 3) * 0.15;
        v.ring.scale.set(scale, scale, 1);
        v.ringMat.opacity = 0.35 - Math.sin(t * 3) * 0.15;
      });

      /* Update label posisi */
      if (labelContainer) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        rooms.forEach((r) => {
          const pos = new THREE.Vector3(r.x + r.w / 2 + OX, 1.8, r.z + r.d / 2 + OZ);
          pos.project(camera);
          const el = labelEls[r.name];
          if (!el) return;
          if (pos.z > 1) { el.style.display = "none"; return; }
          el.style.display = "";
          el.style.left = ((pos.x * 0.5 + 0.5) * cw) + "px";
          el.style.top = ((-pos.y * 0.5 + 0.5) * ch) + "px";
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    /* ---- Interaksi: klik relay ---- */
    const md = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      md.x = e.clientX;
      md.y = e.clientY;
    };

    const findDataParent = (obj: THREE.Object3D): { type: string; id: string } | null => {
      let cur: THREE.Object3D | null = obj;
      while (cur) {
        if (cur.userData?.type) return cur.userData as { type: string; id: string };
        cur = cur.parent;
      }
      return null;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - md.x;
      const dy = e.clientY - md.y;
      if (Math.sqrt(dx * dx + dy * dy) > 6) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(allClickable, false);
      if (hits.length > 0) {
        const data = findDataParent(hits[0].object);
        if (data && data.type === "relay") {
          onRelayToggle(data.id);
        }
      }
    };

    /* ---- Interaksi: hover tooltip ---- */
    const tooltip = tooltipRef.current;

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(allClickable, false);

      if (hits.length > 0) {
        const data = findDataParent(hits[0].object);
        if (data && tooltip) {
          renderer.domElement.style.cursor = "pointer";
          let html = "";
          if (data.type === "relay") {
            const r = relays.find((r) => r.id === data.id);
            if (r) {
              html = `<div class="font-semibold text-t1 mb-1">${r.name}</div>
                <div class="text-t2 text-[11px]">${r.room}</div>
                <div class="mt-1.5 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full ${r.state ? "bg-accent" : "bg-t2"}"></span>
                  <span class="${r.state ? "text-accent" : "text-t2"} text-xs font-mono">${r.state ? "AKTIF" : "MATI"}</span>
                </div>
                <div class="text-[10px] text-t2 mt-1">Klik untuk toggle</div>`;
            }
          } else {
            const s = sensors.find((s) => s.id === data.id);
            if (s) {
              const val = s.isBool ? s.status : `${s.value}${s.unit}`;
              html = `<div class="font-semibold text-t1 mb-1">${s.name}</div>
                <div class="text-t2 text-[11px]">${s.room}</div>
                <div class="mt-1.5 text-warn font-mono text-sm font-semibold">${val}</div>`;
            }
          }
          tooltip.innerHTML = html;
          tooltip.classList.add("show");
          const cRect = container.getBoundingClientRect();
          tooltip.style.left = (e.clientX - cRect.left + 16) + "px";
          tooltip.style.top = (e.clientY - cRect.top - 10) + "px";
          return;
        }
      }

      renderer.domElement.style.cursor = "grab";
      if (tooltip) tooltip.classList.remove("show");
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    /* ---- Resize ---- */
    const onResize = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    };
    window.addEventListener("resize", onResize);

    /* Cleanup */
    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(sceneRef.current!.animId);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [buildFloorplan, buildRelayMarkers, buildSensorMarkers, onRelayToggle]);

  return (
    <div ref={containerRef} className="dash-viewport bg-base">
      <div ref={labelContainerRef} />
      <div ref={tooltipRef} id="tooltip-3d" />

      {/* Legenda bawah viewport */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 fade-up" style={{ animationDelay: "0.3s" }}>
        <div className="bg-card/90 backdrop-blur-md border border-bdr rounded-xl px-4 py-2.5 flex items-center gap-4 text-xs text-t2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-accent inline-block opacity-80" />
            Relay Aktif
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block opacity-80 rotate-45"
              style={{ width: 10, height: 10, background: "var(--color-warn)", borderRadius: 2 }}
            />
            Sensor
          </div>
          <div className="text-bdr">|</div>
          <div>Drag untuk rotasi, Scroll untuk zoom, Klik relay untuk toggle</div>
        </div>
      </div>
    </div>
  );
}