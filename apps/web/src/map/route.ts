import * as maplibregl from "maplibre-gl";
import type { LngLat } from "@/lib/geo";

const SRC = "route";
const GLOW = "route-glow";
const CASING = "route-casing";
const FILL = "route-fill";

const ROUTE = "#56a8fb";
const ROUTE_RGBA0 = "rgba(86,168,251,0)";
const CASING_COLOR = "#2f7ac6";

// "zoom" may only appear at the top level of an interpolate, so each layer
// gets its own stops rather than a multiplied shared expression.
function width(mult: number): maplibregl.ExpressionSpecification {
  return [
    "interpolate", ["linear"], ["zoom"],
    10, 3 * mult, 13, 4 * mult, 16, 6 * mult, 19, 10 * mult,
  ];
}

const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

export function addRouteLayers(map: maplibregl.Map, beforeId?: string) {
  if (map.getSource(SRC)) return;
  map.addSource(SRC, { type: "geojson", data: EMPTY, lineMetrics: true });

  const common = { type: "line" as const, source: SRC, layout: { "line-cap": "round" as const, "line-join": "round" as const } };

  map.addLayer(
    {
      id: GLOW,
      ...common,
      paint: {
        "line-color": ROUTE,
        "line-opacity": 0.3,
        "line-blur": 10,
        "line-width": width(2.5),
      },
    },
    beforeId,
  );
  map.addLayer(
    {
      id: CASING,
      ...common,
      paint: { "line-color": CASING_COLOR, "line-width": width(1.2) },
    },
    beforeId,
  );
  map.addLayer(
    {
      id: FILL,
      ...common,
      paint: {
        "line-color": ROUTE,
        "line-width": width(1),
        "line-gradient": gradientAt(0),
      },
    },
    beforeId,
  );
}

function gradientAt(phase: number): maplibregl.ExpressionSpecification {
  const p = Math.min(1, Math.max(0, phase));
  if (p >= 1) return ["interpolate", ["linear"], ["line-progress"], 0, ROUTE, 1, ROUTE];
  const a = Math.max(0, p - 0.03);
  if (p <= 0.0001) {
    return ["interpolate", ["linear"], ["line-progress"], 0, ROUTE_RGBA0, 1, ROUTE_RGBA0];
  }
  return [
    "interpolate", ["linear"], ["line-progress"],
    a, ROUTE,
    p, ROUTE_RGBA0,
  ];
}

const ROUTE_DONE = "rgba(86,168,251,0.28)";

/** During guidance: the walked part fades back, the remainder stays bright. */
export function setRouteProgress(map: maplibregl.Map, frac: number) {
  const p = Math.min(0.999, Math.max(0, frac));
  map.setPaintProperty(FILL, "line-gradient", [
    "interpolate", ["linear"], ["line-progress"],
    0, ROUTE_DONE,
    p, ROUTE_DONE,
    Math.min(1, p + 0.002), ROUTE,
    1, ROUTE,
  ]);
}

export function clearRoute(map: maplibregl.Map) {
  const src = map.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
  src?.setData(EMPTY);
}

/**
 * Put the route on the map and animate the bright fill from the user outward
 * over `durationMs`. Casing and glow show the full path at once so the
 * information is there even if the reveal is interrupted.
 */
export function showRoute(
  map: maplibregl.Map,
  coords: LngLat[],
  opts: { durationMs?: number; delayMs?: number; reduceMotion?: boolean } = {},
): Promise<void> {
  const { durationMs = 900, delayMs = 200, reduceMotion = false } = opts;
  const src = map.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
  if (!src) return Promise.resolve();

  src.setData({
    type: "FeatureCollection",
    features: [{ type: "Feature", geometry: { type: "LineString", coordinates: coords }, properties: {} }],
  });

  if (reduceMotion) {
    map.setPaintProperty(FILL, "line-gradient", gradientAt(1));
    return Promise.resolve();
  }

  map.setPaintProperty(FILL, "line-gradient", gradientAt(0));

  return new Promise((resolve) => {
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now + delayMs;
      const t = (now - start) / durationMs;
      if (t < 0) {
        requestAnimationFrame(tick);
        return;
      }
      const eased = 1 - Math.pow(1 - Math.min(1, t), 3); // ease-out cubic
      map.setPaintProperty(FILL, "line-gradient", gradientAt(eased));
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}
