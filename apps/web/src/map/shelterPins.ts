import * as maplibregl from "maplibre-gl";
import type { Shelter } from "@/lib/shelters";

const SRC = "shelters";
const ALL_LAYER = "shelters-all";
const TARGET_LAYER = "shelter-target";
const TARGET_SRC = "shelter-target";
const PIN_IMG = "shelter-pin";

const GREEN = "48,197,115";

function makePin(map: maplibregl.Map): maplibregl.StyleImageInterface & { pulseUntil: number } {
  const size = 160;
  let ctx: CanvasRenderingContext2D | null = null;
  return {
    width: size,
    height: size,
    data: new Uint8ClampedArray(size * size * 4),
    pulseUntil: 0,
    onAdd() {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      ctx = c.getContext("2d");
    },
    render() {
      if (!ctx) return false;
      const pulsing = performance.now() < this.pulseUntil;
      const t = pulsing ? (performance.now() % 1000) / 1000 : 0;
      ctx.clearRect(0, 0, size, size);

      if (pulsing) {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 22 + 50 * t, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN},${(1 - t) * 0.6})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 22, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GREEN},1)`;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 5;
      ctx.fill();
      ctx.stroke();
      // House glyph
      ctx.fillStyle = "#0c0c0c";
      ctx.beginPath();
      ctx.moveTo(size / 2, size / 2 - 11);
      ctx.lineTo(size / 2 + 11, size / 2 - 1);
      ctx.lineTo(size / 2 + 7, size / 2 - 1);
      ctx.lineTo(size / 2 + 7, size / 2 + 9);
      ctx.lineTo(size / 2 - 7, size / 2 + 9);
      ctx.lineTo(size / 2 - 7, size / 2 - 1);
      ctx.lineTo(size / 2 - 11, size / 2 - 1);
      ctx.closePath();
      ctx.fill();

      this.data = ctx.getImageData(0, 0, size, size).data;
      if (pulsing) map.triggerRepaint();
      return true;
    },
  };
}

let pinImage: ReturnType<typeof makePin> | null = null;

export function addShelterLayers(map: maplibregl.Map, beforeId?: string) {
  if (map.getSource(SRC)) return;
  pinImage = makePin(map);
  map.addImage(PIN_IMG, pinImage, { pixelRatio: 2 });

  map.addSource(SRC, {
    type: "geojson",
    data: "/data/shelters-wi.geojson",
    cluster: true,
    clusterMaxZoom: 13,
    clusterRadius: 40,
  });

  // Quiet background dots: visible only when zoomed in, never clustered pins.
  map.addLayer(
    {
      id: ALL_LAYER,
      type: "circle",
      source: SRC,
      filter: ["!", ["has", "point_count"]],
      minzoom: 12,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 2.5, 16, 5],
        "circle-color": `rgba(${GREEN},0.55)`,
        "circle-stroke-color": "rgba(12,12,12,0.9)",
        "circle-stroke-width": 1,
        "circle-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 13, 1],
      },
    },
    beforeId,
  );

  map.addSource(TARGET_SRC, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });
  map.addLayer({
    id: TARGET_LAYER,
    type: "symbol",
    source: TARGET_SRC,
    layout: {
      "icon-image": PIN_IMG,
      "icon-allow-overlap": true,
      "icon-ignore-placement": true,
      "icon-anchor": "center",
    },
  });
}

export function setTargetShelter(map: maplibregl.Map, s: Shelter | null) {
  const src = map.getSource(TARGET_SRC) as maplibregl.GeoJSONSource | undefined;
  if (!src) return;
  src.setData({
    type: "FeatureCollection",
    features: s
      ? [{ type: "Feature", geometry: { type: "Point", coordinates: [s.lng, s.lat] }, properties: { id: s.id } }]
      : [],
  });
}

/** Three one-second pulses, then static. */
export function pulseTarget(map: maplibregl.Map, cycles = 3) {
  if (!pinImage) return;
  pinImage.pulseUntil = performance.now() + cycles * 1000;
  map.triggerRepaint();
}
