import type * as maplibregl from "maplibre-gl";

export const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

const LAND = "#0c0c0c";
const WATER = "#2a3038";
const LABEL = "#bdbdbd";
const HALO = "rgba(0,0,0,0.7)";
const ROAD_MINOR = "#3a3a3a";
const ROAD_MAJOR = "#444444";
const ROAD_HIGHWAY = "#505050";

/**
 * Lift OpenFreeMap Dark toward the Protomaps-style ramp from the design spec:
 * roads lighter than land, labels at 10:1, water a desaturated blue-gray.
 * Works by layer id / source-layer so a style update upstream does not break it.
 */
export function applyDarkOverrides(map: maplibregl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;

  for (const layer of style.layers) {
    const id = layer.id;
    const srcLayer = "source-layer" in layer ? layer["source-layer"] : undefined;

    if (layer.type === "fill" && (id === "water" || srcLayer === "water")) {
      map.setPaintProperty(id, "fill-color", WATER);
      continue;
    }

    if (layer.type === "line" && srcLayer === "transportation") {
      const casing = /casing|outer/.test(id);
      if (casing) {
        map.setPaintProperty(id, "line-color", LAND);
        continue;
      }
      let color = ROAD_MINOR;
      if (/motorway|trunk/.test(id)) color = ROAD_HIGHWAY;
      else if (/primary|secondary|major/.test(id)) color = ROAD_MAJOR;
      map.setPaintProperty(id, "line-color", color);
      continue;
    }

    if (layer.type === "symbol") {
      const layout = layer.layout as Record<string, unknown> | undefined;
      if (layout && "text-field" in layout) {
        map.setPaintProperty(id, "text-color", LABEL);
        map.setPaintProperty(id, "text-halo-color", HALO);
        map.setPaintProperty(id, "text-halo-width", 1);
      }
      // POI icons add clutter on a crisis map.
      if (/poi/.test(id)) map.setLayoutProperty(id, "visibility", "none");
    }
  }
}

/** First symbol layer id, so data layers can sit under labels. */
export function firstSymbolLayerId(map: maplibregl.Map): string | undefined {
  return map.getStyle()?.layers?.find((l) => l.type === "symbol")?.id;
}
