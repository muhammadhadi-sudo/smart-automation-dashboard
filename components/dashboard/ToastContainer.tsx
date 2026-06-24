"use client";

import { useState, useCallback } from "react";
import { ToastItem } from "@/lib/types";

let toastIdCounter = 0;

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => {
    const id = `toast-${++toastIdCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  /* Expose addToast ke parent via custom event */
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, (msg: string, type?: ToastItem["type"]) => void>).__addToast = addToast;
  }

  const iconMap = {
    success: "check_circle",
    warning: "warning_amber",
    info: "info",
  };

  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type} show`}>
          <span className="material-icons-round text-lg">{iconMap[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* Helper untuk dipanggil dari komponen manapun */
export function showToast(message: string, type: ToastItem["type"] = "info") {
  if (typeof window !== "undefined") {
    const fn = (window as unknown as Record<string, (msg: string, type?: ToastItem["type"]) => void>).__addToast;
    if (fn) fn(message, type);
  }
}