// Colour of steel at temperature (°C): cold grey, then the incandescence ramp
// a forge operator reads by eye, from dull red to yellow-white.
const STOPS: [number, [number, number, number]][] = [
  [30, [86, 98, 110]],
  [420, [78, 80, 88]],
  [560, [107, 26, 18]],
  [700, [194, 45, 23]],
  [860, [242, 92, 15]],
  [1020, [255, 150, 30]],
  [1150, [255, 196, 84]],
  [1250, [255, 231, 163]],
  [1450, [255, 241, 200]],
  [1600, [255, 249, 230]],
];

export function tempRGB(t: number): [number, number, number] {
  if (t <= STOPS[0][0]) return STOPS[0][1];
  for (let i = 1; i < STOPS.length; i++) {
    const [t1, c1] = STOPS[i];
    if (t <= t1) {
      const [t0, c0] = STOPS[i - 1];
      const k = (t - t0) / (t1 - t0);
      return [c0[0] + (c1[0] - c0[0]) * k, c0[1] + (c1[1] - c0[1]) * k, c0[2] + (c1[2] - c0[2]) * k];
    }
  }
  return STOPS[STOPS.length - 1][1];
}

export const tempCSS = (t: number, a = 1) => {
  const [r, g, b] = tempRGB(t);
  return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
};

/** How brightly metal at this temperature lights its surroundings, 0..1. */
export const glowAt = (t: number) => Math.max(0, Math.min(1, (t - 560) / 600));
