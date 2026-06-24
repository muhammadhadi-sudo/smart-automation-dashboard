import dynamic from "next/dynamic";

/* Three.js tidak bisa di-SSR, jadi gunakan dynamic import */
const Dashboard = dynamic(() => import("@/components/dashboard/Dashboard"), {
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

export default function Home() {
  return <Dashboard />;
}