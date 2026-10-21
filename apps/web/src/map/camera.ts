import type * as maplibregl from "maplibre-gl";
import { bboxOf, bearingDeg, type LngLat } from "@/lib/geo";
import { bearingDelta } from "@/lib/navigation";

export const IDLE_PITCH = 55;
export const IDLE_BEARING = -17;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Open already on the city, slightly high, and settle in. */
export function intro(map: maplibregl.Map, center: LngLat, reduce: boolean) {
  map.jumpTo({ center, zoom: 13.4, pitch: 62, bearing: IDLE_BEARING - 6 });
  map.easeTo({
    zoom: 14.7,
    pitch: IDLE_PITCH,
    bearing: IDLE_BEARING,
    duration: reduce ? 0 : 2800,
    easing: easeOutCubic,
    essential: false,
  });
}

// ---- idle drift: a very slow orbit so the city feels alive ---------------
let driftId: number | null = null;
const DRIFT_DEG_PER_MS = 0.0006; // ~2 degrees every 3 s

export function startDrift(map: maplibregl.Map) {
  stopDrift();
  let last = performance.now();
  const tick = (now: number) => {
    const dt = now - last;
    last = now;
    if (!map.isMoving()) map.setBearing(map.getBearing() + dt * DRIFT_DEG_PER_MS);
    driftId = requestAnimationFrame(tick);
  };
  driftId = requestAnimationFrame(tick);
}

export function stopDrift() {
  if (driftId !== null) cancelAnimationFrame(driftId);
  driftId = null;
}

/** Tilted overview of the whole route, looking along its direction of travel. */
export function overview(
  map: maplibregl.Map,
  coords: LngLat[],
  padding: maplibregl.PaddingOptions,
  reduce: boolean,
): Promise<void> {
  const bearing = coords.length > 1 ? bearingDeg(coords[0], coords[coords.length - 1]) : 0;
  return new Promise((resolve) => {
    map.once("moveend", () => resolve());
    map.fitBounds(bboxOf(coords), {
      padding,
      bearing,
      pitch: 48,
      duration: reduce ? 0 : 1400,
      easing: easeOutCubic,
      maxZoom: 16.5,
    });
  });
}

/** Ease into the follow camera before the first follow frame. */
export function enterFollow(map: maplibregl.Map, center: LngLat, bearing: number, reduce: boolean): Promise<void> {
  return new Promise((resolve) => {
    map.once("moveend", () => resolve());
    map.easeTo({ center, bearing, pitch: 62, zoom: 17.2, duration: reduce ? 0 : 1100, easing: easeOutCubic });
  });
}

/**
 * One frame of the follow camera. Bearing is smoothed so turns swing rather
 * than snap; the camera sits a little behind the dot so the road ahead is
 * visible above it.
 */
export function followFrame(map: maplibregl.Map, center: LngLat, targetBearing: number) {
  const current = map.getBearing();
  const bearing = current + bearingDelta(current, targetBearing) * 0.08;
  map.jumpTo({ center, bearing, pitch: 62, zoom: 17.2 });
}
