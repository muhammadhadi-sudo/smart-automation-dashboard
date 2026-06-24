"use client";

import { useState } from "react";
import { showToast } from "./ToastContainer";

const menuItems = [
  { icon: "dashboard", title: "Dashboard" },
  { icon: "view_in_ar", title: "Floorplan 3D" },
  { icon: "devices", title: "Perangkat" },
  { icon: "auto_awesome", title: "Otomasi" },
  { icon: "analytics", title: "Analitik" },
];

export default function Sidebar() {
  const [active, setActive] = useState(0);

  const handleClick = (index: number, title: string) => {
    setActive(index);
    if (title !== "Dashboard" && title !== "Floorplan 3D") {
      showToast(`${title} — Segera hadir`, "info");
    }
  };

  return (
    <aside className="dash-sidebar bg-card border-r border-bdr flex flex-col items-center py-4 gap-2">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center mb-4">
        <span className="material-icons-round text-accent text-xl">hub</span>
      </div>

      {/* Menu items */}
      {menuItems.map((item, i) => (
        <div
          key={item.title}
          className={`sb-item ${active === i ? "active" : ""}`}
          title={item.title}
          onClick={() => handleClick(i, item.title)}
        >
          <span className="material-icons-round text-xl">{item.icon}</span>
        </div>
      ))}

      <div className="flex-1" />

      {/* Settings di bawah */}
      <div
        className={`sb-item ${active === -1 ? "active" : ""}`}
        title="Pengaturan"
        onClick={() => {
          setActive(-1);
          showToast("Pengaturan — Segera hadir", "info");
        }}
      >
        <span className="material-icons-round text-xl">settings</span>
      </div>
    </aside>
  );
}