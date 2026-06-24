"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("./Dashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-base">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-t2 font-mono text-sm">Memuat Dashboard...</span>
      </div>
    </div>
  ),
});

export default function DashboardLoader() {
  return <Dashboard />;
}