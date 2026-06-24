export interface Room {
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
}

export interface Relay {
  id: string;
  name: string;
  room: string;
  x: number;
  z: number;
  state: boolean;
  icon: string;
}

export interface Sensor {
  id: string;
  name: string;
  room: string;
  x: number;
  z: number;
  value: number;
  unit: string;
  icon: string;
  min: number;
  max: number;
  isBool?: boolean;
  status?: string;
  history?: number[];
}

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "warning" | "info";
}

export type ClickableData = {
  type: "relay" | "sensor";
  id: string;
};