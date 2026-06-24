"use client";

import { useCallback } from "react";
import { relays } from "@/lib/data";
import { showToast } from "./ToastContainer";
import ToggleSwitch from "../ui/ToggleSwitch";

interface RelayPanelProps {
  panelOpen: boolean;
}

export default function RelayPanel({ panelOpen }: RelayPanelProps) {
  const activeCount = relays.filter((r) => r.state).length;

  const handleToggle = useCallback((id: string) => {
    const r = relays.find((r) => r.id === id);
    if (!r) return;
    r.state = !r.state;

    /* Update visual 3D */
    if (typeof window !== "undefined") {
      const fn = (window as unknown as Record<string, (id: string) => void>).__updateRelayVisual;
      if (fn) fn(id);
    }

    showToast(`${r.name} ${r.state ? "diaktifkan" : "dimatikan"}`, r.state ? "success" : "info");

    /* Force re-render dengan event */
    window.dispatchEvent(new CustomEvent("relay-updated"));
  }, []);

  /* Dengarkan perubahan relay dari 3D scene juga */
  if (typeof window !== "undefined" && !window.__relayListenerAdded) {
    window.__relayListenerAdded = true;
    window.addEventListener("relay-updated", () => {
      /* Trigger re-render via forceUpdate trick */
      window.dispatchEvent(new Event("force-relay-render"));
    });
  }

  return (
    <div className="p-4 border-b border-bdr">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-sm text-t1 tracking-wide">
          Kontrol Relay
        </h2>
        <span className="text-[10px] font-mono text-t2 bg-base px-2 py-0.5 rounded-full">
          {activeCount}/{relays.length} AKTIF
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {relays.map((r, i) => (
          <div
            key={r.id}
            className="relay-card flex items-center gap-3 p-3 rounded-xl border border-bdr/50 cursor-default fade-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                r.state ? "bg-accent-dim" : "bg-base"
              }`}
            >
              <span
                className={`material-icons-round text-lg ${
                  r.state ? "text-accent" : "text-t2"
                }`}
              >
                {r.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-t1 truncate">{r.name}</div>
              <div className="text-[10px] text-t2 truncate">{r.room}</div>
            </div>
            <ToggleSwitch id={r.id} isOn={r.state} onChange={handleToggle} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Extend Window type */
declare global {
  interface Window {
    __relayListenerAdded?: boolean;
  }
}