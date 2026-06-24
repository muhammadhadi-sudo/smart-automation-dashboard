"use client";

import { useEffect, useRef, useCallback } from "react";
import { sensors } from "@/lib/data";
import { Sensor } from "@/lib/types";
import { showToast } from "./ToastContainer";

function getSensorColor(s: Sensor): string {
  if (s.isBool) return "#00e676";
  const pct = (s.value - s.min) / (s.max - s.min);
  if (pct < 0.4) return "#00e676";
  if (pct < 0.7) return "#ff9100";
  return "#ff1744";
}

function drawSparkline(canvasId: string, data: number[], color: string) {
  const c = document.getElementById(canvasId) as HTMLCanvasElement | null;
  if (!c || !data || data.length < 2) return;
  const ctx = c.getContext("2d");
  if (!ctx) return;
  const w = c.width;
  const h = c.height;
  ctx.clearRect(0, 0, w, h);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  /* Garis */
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  /* Area fill */
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = `${color}15`;
  ctx.fill();
}

export default function SensorPanel() {
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const renderKeyRef = useRef(0);

  const updateSensorData = useCallback(() => {
    sensors.forEach((s) => {
      if (s.isBool) {
        if (Math.random() < 0.05) {
          const alertMap: Record<string, string[]> = {
            s4: ["Tidak Aktif", "Terdeteksi"],
            s6: ["Normal", "Terdeteksi"],
            s7: ["Normal", "Terdeteksi"],
            s8: ["Tertutup", "Terbuka"],
          };
          const opts = alertMap[s.id];
          if (opts) {
            s.status = opts[Math.random() < 0.3 ? 1 : 0];
            s.value = s.status === opts[0] ? 0 : 1;
            if (s.status !== opts[0]) {
              showToast(`Peringatan: ${s.name} — ${s.status}`, "warning");
            }
          }
        }
      } else {
        const drift = (Math.random() - 0.5) * 0.8;
        s.value = Math.max(s.min, Math.min(s.max, s.value + drift));
        s.history!.push(s.value);
        if (s.history!.length > 25) s.history!.shift();
      }
    });

    /* Update DOM secara langsung tanpa re-render penuh */
    sensors.forEach((s, idx) => {
      const card = document.querySelectorAll(".sensor-card")[idx];
      if (!card) return;
      const valEl = card.querySelector(".sensor-val") as HTMLElement;
      const dotEl = card.querySelector(".pulse-dot") as HTMLElement;

      if (s.isBool) {
        const isAlert =
          s.status !== "Normal" && s.status !== "Tidak Aktif" && s.status !== "Tertutup";
        if (valEl) {
          valEl.textContent = s.status!;
          valEl.className = `sensor-val font-mono font-semibold text-lg ${isAlert ? "text-danger" : "text-accent"}`;
        }
        if (dotEl) dotEl.className = `pulse-dot ${isAlert ? "active" : "inactive"}`;
      } else {
        if (valEl) {
          valEl.textContent = `${s.value.toFixed(1)}${s.unit}`;
          valEl.className = `sensor-val font-mono font-semibold text-lg ${getSensorColor(s).replace("#", "text-").replace(/([0-9a-f]{2})/gi, "")}`;
          /* Lebih sederhana: langsung set color via style */
          valEl.style.color = getSensorColor(s);
          valEl.className = "sensor-val font-mono font-semibold text-lg";
        }
        drawSparkline(`spark-${s.id}`, s.history!, getSensorColor(s));
      }
    });
  }, []);

  useEffect(() => {
    /* Gambar sparkline awal */
    sensors.forEach((s) => {
      if (!s.isBool) {
        drawSparkline(`spark-${s.id}`, s.history!, getSensorColor(s));
      }
    });

    /* Interval update */
    updateIntervalRef.current = setInterval(updateSensorData, 2500);

    return () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    };
  }, [updateSensorData]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-sm text-t1 tracking-wide">
          Monitor Sensor
        </h2>
        <span className="text-[10px] font-mono text-accent flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
          LIVE
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {sensors.map((s, i) => {
          const valColor = s.isBool
            ? "text-accent"
            : getSensorColor(s);
          const isAlert =
            s.isBool &&
            s.status !== "Normal" &&
            s.status !== "Tidak Aktif" &&
            s.status !== "Tertutup";
          const displayVal = s.isBool ? s.status : `${s.value.toFixed(1)}${s.unit}`;

          return (
            <div
              key={s.id}
              className="sensor-card p-3 rounded-xl border border-bdr/50 fade-up"
              style={{ animationDelay: `${i * 0.05 + 0.2}s` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-warn/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-lg text-warn">{s.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-t1 truncate">{s.name}</div>
                  <div className="text-[10px] text-t2 truncate">{s.room}</div>
                </div>
                <div className={`pulse-dot ${isAlert ? "active" : "inactive"}`} />
              </div>
              <div className="flex items-end justify-between">
                <span
                  className="sensor-val font-mono font-semibold text-lg"
                  style={{ color: s.isBool ? (isAlert ? "#ff1744" : "#00e676") : valColor }}
                >
                  {displayVal}
                </span>
                {!s.isBool ? (
                  <canvas
                    id={`spark-${s.id}`}
                    width={100}
                    height={28}
                    className="opacity-70"
                  />
                ) : (
                  <span className="text-[10px] text-t2 font-mono">{s.id.toUpperCase()}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}