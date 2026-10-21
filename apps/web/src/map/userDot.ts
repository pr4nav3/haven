import * as maplibregl from "maplibre-gl";
import type { LngLat } from "@/lib/geo";

const SRC = "user";
const DOT_LAYER = "user-dot";
const RING_LAYER = "user-accuracy";
const CONE_LAYER = "user-heading";
const IMG = "pulsing-dot";
const IMG_STATIC = "static-dot";
const IMG_CONE = "heading-cone";

const BLUE = "86,168,251";
const GREY = "154,154,154";

function makeDot(map: maplibregl.Map, rgb: string, pulse: boolean): maplibregl.StyleImageInterface {
  const size = 140;
  let ctx: CanvasRenderingContext2D | null = null;
  return {
    width: size,
    height: size,
    data: new Uint8ClampedArray(size * size * 4),
    onAdd() {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      ctx = c.getContext("2d");
    },
    render() {
      if (!ctx) return false;
      const t = pulse ? (performance.now() % 1400) / 1400 : 0.35;
      const inner = 22;
      const outer = pulse ? inner + 44 * t : 40;

      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, outer, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${pulse ? 0.45 * (1 - t) : 0.15})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, inner, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},1)`;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 5;
      ctx.fill();
      ctx.stroke();

      this.data = ctx.getImageData(0, 0, size, size).data;
      if (pulse) map.triggerRepaint();
      return true;
    },
  };
}

/** A soft 60° sector pointing up; rotated by the heading property on the map plane. */
function makeCone(): maplibregl.StyleImageInterface {
  const size = 240;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  const cx = size / 2, cy = size / 2, r = 110;
  const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
  grad.addColorStop(0, `rgba(${BLUE},0.45)`);
  grad.addColorStop(1, `rgba(${BLUE},0)`);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, -Math.PI / 2 - Math.PI / 6, -Math.PI / 2 + Math.PI / 6);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  return { width: size, height: size, data: ctx.getImageData(0, 0, size, size).data };
}

export function addUserLayers(map: maplibregl.Map, reduceMotion: boolean) {
  if (map.getSource(SRC)) return;
  map.addImage(IMG, makeDot(map, BLUE, !reduceMotion), { pixelRatio: 2 });
  map.addImage(IMG_STATIC, makeDot(map, GREY, false), { pixelRatio: 2 });
  map.addImage(IMG_CONE, makeCone(), { pixelRatio: 2 });

  map.addSource(SRC, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  map.addLayer({
    id: RING_LAYER,
    type: "circle",
    source: SRC,
    filter: ["all", [">", ["get", "accuracy"], 25]],
    paint: {
      // r22 is the ring radius in px at zoom 22; base-2 interpolation halves it per zoom level.
      "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 0, 0, 22, ["get", "r22"]],
      "circle-color": `rgba(${BLUE},0.10)`,
      "circle-stroke-color": `rgba(${BLUE},0.35)`,
      "circle-stroke-width": 1,
      "circle-pitch-alignment": "map",
    },
  });

  map.addLayer({
    id: CONE_LAYER,
    type: "symbol",
    source: SRC,
    filter: ["==", ["get", "hasHeading"], true],
    layout: {
      "icon-image": IMG_CONE,
      "icon-rotate": ["get", "heading"],
      "icon-rotation-alignment": "map",
      "icon-pitch-alignment": "map",
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  });

  map.addLayer({
    id: DOT_LAYER,
    type: "symbol",
    source: SRC,
    layout: {
      "icon-image": ["case", ["get", "stale"], IMG_STATIC, IMG],
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
    },
  });
}

export function setUserPosition(
  map: maplibregl.Map,
  at: LngLat,
  accuracyM: number | null,
  opts: { stale?: boolean; heading?: number | null } = {},
) {
  const src = map.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
  if (!src) return;
  const mpp22 = (156543.03392 * Math.cos((at[1] * Math.PI) / 180)) / 2 ** 22;
  const r22 = (accuracyM ?? 0) / mpp22;
  const heading = opts.heading ?? null;
  src.setData({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: at },
        properties: {
          accuracy: accuracyM ?? 0,
          r22,
          stale: opts.stale ?? false,
          hasHeading: heading !== null,
          heading: heading ?? 0,
        },
      },
    ],
  });
}
