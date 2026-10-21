import { bearingDeg, haversineMi, type LngLat } from "./geo";

/** A route with cumulative distances so we can move along it by meters. */
export type RouteGeom = {
  coords: LngLat[];
  cum: number[]; // cumulative meters at each vertex
  total: number; // meters
};

const M_PER_MI = 1609.344;

export function prepareRoute(coords: LngLat[]): RouteGeom {
  const cum = [0];
  for (let i = 1; i < coords.length; i++) {
    cum.push(cum[i - 1] + haversineMi(coords[i - 1], coords[i]) * M_PER_MI);
  }
  return { coords, cum, total: cum[cum.length - 1] ?? 0 };
}

/** Point and heading `d` meters along the route. */
export function pointAt(g: RouteGeom, d: number): { point: LngLat; bearing: number } {
  const n = g.coords.length;
  if (n === 0) return { point: [0, 0], bearing: 0 };
  if (n === 1 || d <= 0) {
    return { point: g.coords[0], bearing: n > 1 ? bearingDeg(g.coords[0], g.coords[1]) : 0 };
  }
  if (d >= g.total) {
    return { point: g.coords[n - 1], bearing: bearingDeg(g.coords[n - 2], g.coords[n - 1]) };
  }
  // binary search for the segment containing d
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (g.cum[mid] <= d) lo = mid;
    else hi = mid;
  }
  const a = g.coords[lo], b = g.coords[hi];
  const seg = g.cum[hi] - g.cum[lo];
  const t = seg > 0 ? (d - g.cum[lo]) / seg : 0;
  return {
    point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
    bearing: bearingDeg(a, b),
  };
}

/**
 * Snap a GPS position to the route. Returns meters along the route and the
 * snapped point. Planar approximation in a locally scaled lng/lat frame,
 * which is plenty for a route a few miles long.
 */
export function snapToRoute(g: RouteGeom, p: LngLat): { d: number; point: LngLat; offM: number } {
  const k = Math.cos((p[1] * Math.PI) / 180);
  let best = { d: 0, point: g.coords[0] ?? p, dist2: Infinity };
  for (let i = 1; i < g.coords.length; i++) {
    const a = g.coords[i - 1], b = g.coords[i];
    const ax = a[0] * k, ay = a[1], bx = b[0] * k, by = b[1], px = p[0] * k, py = p[1];
    const vx = bx - ax, vy = by - ay;
    const len2 = vx * vx + vy * vy;
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / len2)) : 0;
    const qx = ax + vx * t, qy = ay + vy * t;
    const dist2 = (px - qx) ** 2 + (py - qy) ** 2;
    if (dist2 < best.dist2) {
      best = { d: g.cum[i - 1] + (g.cum[i] - g.cum[i - 1]) * t, point: [qx / k, qy], dist2 };
    }
  }
  const offM = haversineMi(p, best.point) * M_PER_MI;
  return { d: best.d, point: best.point, offM };
}

/** Shortest signed difference between two bearings, in degrees. */
export function bearingDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

/** Walking speed used for ETA when the router cannot give one. */
export const WALK_MPS = 1.3;
