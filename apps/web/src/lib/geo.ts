export type LngLat = [number, number];

const R_MI = 3958.7613;

export function haversineMi(a: LngLat, b: LngLat): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const la1 = toRad(a[1]);
  const la2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R_MI * Math.asin(Math.sqrt(h));
}

/** Initial bearing from a to b, degrees clockwise from north. */
export function bearingDeg(a: LngLat, b: LngLat): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const la1 = toRad(a[1]);
  const la2 = toRad(b[1]);
  const dLng = toRad(b[0] - a[0]);
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function compassLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

export function bboxOf(coords: LngLat[]): [LngLat, LngLat] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of coords) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [[minX, minY], [maxX, maxY]];
}

export function formatMiles(mi: number): string {
  if (mi < 0.1) return `${Math.round(mi * 5280)} ft`;
  return `${mi < 10 ? mi.toFixed(1) : Math.round(mi)} mi`;
}

export function formatMinutes(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} hr ${m % 60} min`;
}

export const MADISON: LngLat = [-89.4012, 43.0731];
