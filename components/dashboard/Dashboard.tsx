"use client";

import { useState, useCallback, useEffect } from "react";
import { relays } from "@/lib/data";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import FloorplanScene from "./FloorplanScene";
import RelayPanel from "./RelayPanel";
import SensorPanel from "./SensorPanel";
import ToastContainer, { showToast } from "./ToastContainer";

export default function Dashboard() {
  const [relayTick, setRelayTick] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);

  const handleRelayToggle = useCallback((id: string) => {
    const r = relays.find((r) => r.id === id);
    if (!r) return;
    r.state = !r.state;

    /* Update visual 3D marker */
    if (typeof window !== "undefined") {
      const fn = (
        window as unknown as Record<string, (id: string) => void>
      ).__updateRelayVisual;
      if (fn) fn(id);
    }

    showToast(
      `${r.name} ${r.state ? "diaktifkan" : "dimatikan"}`,
      r.state ? "success" : "info"
    );

    /* Force re-render relay panel */
    setRelayTick((t) => t + 1);
  }, []);

  const togglePanel = useCallback(() => {
    setPanelOpen((prev) => !prev);
    setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
  }, []);

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

          {/* key digunakan untuk force re-render saat relay berubah */}
          <RelayPanel key={`relay-${relayTick}`} panelOpen={panelOpen} />
          <SensorPanel />
        </aside>
      </div>

      <ToastContainer />
    </>
  );
}