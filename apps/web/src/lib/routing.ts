import type { LngLat } from "./geo";

export type Route = {
  coordinates: LngLat[];
  distanceM: number;
  durationS: number;
  profile: "foot" | "driving";
};

const OSRM = "https://router.project-osrm.org/route/v1";
const TIMEOUT_MS = 4000;

/**
 * Fetch a route from the public OSRM demo server. Walking under a mile,
 * driving otherwise. Throws on timeout or failure so the caller can fall
 * back to a straight-line compass card.
 */
export async function fetchRoute(from: LngLat, to: LngLat, straightMi: number): Promise<Route> {
  const profile: Route["profile"] = straightMi < 1 ? "foot" : "driving";
  const url =
    `${OSRM}/${profile}/${from[0]},${from[1]};${to[0]},${to[1]}` +
    `?overview=full&geometries=geojson&steps=false`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const json = (await res.json()) as {
      code: string;
      routes?: Array<{
        geometry: { coordinates: LngLat[] };
        distance: number;
        duration: number;
      }>;
    };
    const r = json.routes?.[0];
    if (json.code !== "Ok" || !r) throw new Error(`OSRM ${json.code}`);
    // The public demo server serves the car graph for every profile name, so
    // derive walking time from distance at a brisk 1.3 m/s.
    const durationS = profile === "foot" ? r.distance / 1.3 : r.duration;
    return {
      coordinates: r.geometry.coordinates,
      distanceM: r.distance,
      durationS,
      profile,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function mapsLink(to: LngLat, label: string): string {
  const q = encodeURIComponent(`${to[1]},${to[0]} (${label})`);
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}
