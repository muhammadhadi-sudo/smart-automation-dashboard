"use client";

import { useEffect, useState } from "react";

export default function TopBar() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="dash-topbar bg-card border-b border-bdr flex items-center justify-between px-6">
      {/* Kiri */}
      <div className="flex items-center gap-3">
        <h1 className="font-display font-bold text-lg text-t1 tracking-tight">
          Smart Automation
        </h1>
        <span className="text-xs font-mono bg-accent-dim text-accent px-2 py-0.5 rounded-full">
          v2.4
        </span>
      </div>

      {/* Tengah */}
      <div className="flex items-center gap-5 text-xs text-t2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          Sistem Online
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-icons-round text-sm">devices</span>
          9 Perangkat
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-icons-round text-sm">schedule</span>
          {time}
        </div>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-card-h flex items-center justify-center cursor-pointer hover:bg-bdr transition-colors relative">
          <span className="material-icons-round text-t2 text-lg">notifications</span>
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-danger rounded-full text-[9px] font-bold flex items-center justify-center">
            3
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-accent-dim flex items-center justify-center text-accent text-xs font-bold cursor-pointer">
          AD
        </div>
      </div>
    </header>
  );
}