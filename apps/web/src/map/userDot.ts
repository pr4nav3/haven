import * as maplibregl from "maplibre-gl";
import type { LngLat } from "@/lib/geo";

const SRC = "user";
const DOT_LAYER = "user-dot";
const RING_LAYER = "user-accuracy";
const IMG = "pulsing-dot";
const IMG_STATIC = "static-dot";

const BLUE = "86,168,251";
const GREY = "154,154,154";

function makeDot(map: maplibregl.Map, rgb: string, pulse: boolean): maplibregl.StyleImageInterface {
  const size = 200;
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
      const t = pulse ? (performance.now() % 1000) / 1000 : 0.35;
      const inner = 30;
      const outer = pulse ? inner + 70 * t : 50;

      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, outer, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},${pulse ? 1 - t : 0.18})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, inner, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},1)`;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;
      ctx.fill();
      ctx.stroke();

      this.data = ctx.getImageData(0, 0, size, size).data;
      if (pulse) map.triggerRepaint();
      return true;
    },
  };
}

export function addUserLayers(map: maplibregl.Map, reduceMotion: boolean) {
  if (map.getSource(SRC)) return;
  map.addImage(IMG, makeDot(map, BLUE, !reduceMotion), { pixelRatio: 2 });
  map.addImage(IMG_STATIC, makeDot(map, GREY, false), { pixelRatio: 2 });

  map.addSource(SRC, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  // Accuracy ring: radius in px derived from meters at current zoom/latitude.
  map.addLayer({
    id: RING_LAYER,
    type: "circle",
    source: SRC,
    filter: ["all", [">", ["get", "accuracy"], 25]],
    paint: {
      // r22 is the ring radius in px at zoom 22; base-2 interpolation halves it per zoom level.
      "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 0, 0, 22, ["get", "r22"]],
      "circle-color": `rgba(${BLUE},0.12)`,
      "circle-stroke-color": `rgba(${BLUE},0.4)`,
      "circle-stroke-width": 1,
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
  stale = false,
) {
  const src = map.getSource(SRC) as maplibregl.GeoJSONSource | undefined;
  if (!src) return;
  // Meters per pixel at zoom 22 for this latitude, so r22 = accuracy / mpp22.
  const mpp22 = (156543.03392 * Math.cos((at[1] * Math.PI) / 180)) / 2 ** 22;
  const r22 = (accuracyM ?? 0) / mpp22;
  src.setData({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: at },
        properties: { accuracy: accuracyM ?? 0, r22, stale },
      },
    ],
  });
}
