import { Room, Relay, Sensor } from "./types";

/* Offset untuk memusatkan floorplan di origin */
export const OX = -7;
export const OZ = -4.5;

export const rooms: Room[] = [
  { name: "Ruang Tamu", x: 0, z: 0, w: 5, d: 5 },
  { name: "Kamar Tidur", x: 5, z: 0, w: 4, d: 5 },
  { name: "Garasi", x: 9, z: 0, w: 5, d: 5 },
  { name: "Dapur", x: 0, z: 5, w: 5, d: 4 },
  { name: "Kamar Mandi", x: 5, z: 5, w: 4, d: 4 },
  { name: "Gudang", x: 9, z: 5, w: 5, d: 4 },
];

export const relays: Relay[] = [
  { id: "r1", name: "Lampu Utama",  room: "Ruang Tamu",  x: 2.5,  z: 1.5, state: true,  icon: "lightbulb" },
  { id: "r2", name: "AC",           room: "Ruang Tamu",  x: 4.2,  z: 3.8, state: false, icon: "ac_unit" },
  { id: "r3", name: "Lampu Tidur",  room: "Kamar Tidur",  x: 7,    z: 1.5, state: true,  icon: "lightbulb" },
  { id: "r4", name: "Lampu Garasi", room: "Garasi",       x: 11.5, z: 1.5, state: false, icon: "lightbulb" },
  { id: "r5", name: "Pintu Garasi", room: "Garasi",       x: 12.5, z: 4,   state: false, icon: "garage" },
  { id: "r6", name: "Lampu Dapur",  room: "Dapur",        x: 2.5,  z: 6.5, state: true,  icon: "lightbulb" },
  { id: "r7", name: "Exhaust Fan",  room: "Kamar Mandi",  x: 8.2,  z: 8,   state: false, icon: "air" },
  { id: "r8", name: "Lampu Mandi",  room: "Kamar Mandi",  x: 6.5,  z: 6.5, state: false, icon: "lightbulb" },
  { id: "r9", name: "Lampu Gudang", room: "Gudang",       x: 11.5, z: 6.5, state: false, icon: "lightbulb" },
];

export const sensors: Sensor[] = [
  { id: "s1", name: "Suhu",       room: "Ruang Tamu",  x: 1,   z: 3.5, value: 26.5, unit: "°C", icon: "thermostat", min: 20, max: 35 },
  { id: "s2", name: "Kelembaban", room: "Ruang Tamu",  x: 4,   z: 1,   value: 62,   unit: "%",  icon: "water_drop", min: 30, max: 90 },
  { id: "s3", name: "Suhu",       room: "Kamar Tidur", x: 6,   z: 4,   value: 24.2, unit: "°C", icon: "thermostat", min: 20, max: 35 },
  { id: "s4", name: "Gerak",      room: "Garasi",      x: 10,  z: 4,   value: 0, unit: "", icon: "sensors", status: "Tidak Aktif", isBool: true },
  { id: "s5", name: "Suhu",       room: "Dapur",       x: 1,   z: 7.5, value: 28.1, unit: "°C", icon: "thermostat", min: 20, max: 40 },
  { id: "s6", name: "Asap",       room: "Dapur",       x: 4,   z: 6.5, value: 0, unit: "", icon: "cloud", status: "Normal", isBool: true },
  { id: "s7", name: "Kebocoran",  room: "Kamar Mandi", x: 8,   z: 7,   value: 0, unit: "", icon: "warning", status: "Normal", isBool: true },
  { id: "s8", name: "Pintu Utama",room: "Ruang Tamu",  x: 0.6, z: 2.5, value: 0, unit: "", icon: "door_front", status: "Tertutup", isBool: true },
];

/* Inisialisasi history sparkline untuk sensor numerik */
sensors.forEach((s) => {
  if (!s.isBool) {
    s.history = Array.from({ length: 24 }, () => s.value + (Math.random() - 0.5) * 3);
    s.history.push(s.value);
  }
});

/* Segmen dinding: [x1, z1, x2, z2] */
export const wallSegments: [number, number, number, number][] = [
  /* Dinding luar */
  [0, 0, 14, 0], [14, 0, 14, 9], [14, 9, 0, 9], [0, 9, 0, 0],
  /* Dinding dalam horizontal */
  [5, 0, 5, 2], [5, 3, 5, 5],
  [9, 0, 9, 3.5], [9, 4.5, 9, 5],
  [0, 5, 2, 5], [3, 5, 6, 5], [7, 5, 10, 5], [11, 5, 14, 5],
  /* Dinding dalam vertikal */
  [5, 5, 5, 6.5], [5, 7.5, 5, 9],
  [9, 5, 9, 7], [9, 8, 9, 9],
];