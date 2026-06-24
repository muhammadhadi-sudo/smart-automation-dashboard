"use client";

interface ToggleSwitchProps {
  id: string;
  isOn: boolean;
  onChange: (id: string) => void;
}

export default function ToggleSwitch({ id, isOn, onChange }: ToggleSwitchProps) {
  return (
    <div
      className={`toggle-sw ${isOn ? "on" : ""}`}
      onClick={() => onChange(id)}
      role="switch"
      aria-checked={isOn}
      aria-label="Toggle relay"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(id);
        }
      }}
    />
  );
}