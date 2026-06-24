"use client";

import { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import FloorplanScene from "./FloorplanScene";
import RelayPanel from "./RelayPanel";
import SensorPanel from "./SensorPanel";
import ToastContainer, { showToast } from "./ToastContainer";

export default function Dashboard() {
  const [panelOpen, setPanelOpen] = useState(true);

  const handleRelayToggle = useCallback((id: string) => {
    /* Toggle state di data */
    const { relays } = require("@/lib/data");
    const r = relays.find((r: { id: string }) => r.id === id);
    if (!r) return;
    r.state = !r.state;

    /* Update visual 3D */
    if (typeof window !== "undefined") {
      const fn = (window as unknown as Record<string, (id: string) => void>).__updateRelayVisual;
      if (fn) fn(id);
    }

    showToast(`${r.name} ${r.state ? "diaktifkan" : "dimatikan"}`, r.state ? "success" : "info");

    /* Trigger re-render relay panel */
    window.dispatchEvent(new CustomEvent("relay-updated"));
  }, []);

  const togglePanel = () => {
    setPanelOpen((prev) => !prev);
    /* Resize Three.js setelah animasi CSS */
    setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
  };

  return (
    <>
      <div className="dash-layout">
        <Sidebar />
        <TopBar />
        <FloorplanScene onRelayToggle={handleRelayToggle} />

        <aside
          className={`dash-rpanel bg-card border-l border-bdr relative ${
            panelOpen ? "" : "rpanel-collapsed"
          }`}
        >
          <div className="panel-toggle" onClick={togglePanel}>
            <span className="material-icons-round text-lg">
              {panelOpen ? "chevron_right" : "chevron_left"}
            </span>
          </div>

          {/* Gunakan key untuk force re-render saat relay berubah */}
          <RelayPanel key={`relay-${Date.now()}`} panelOpen={panelOpen} />
          <SensorPanel />
        </aside>
      </div>

      <ToastContainer />
    </>
  );
}