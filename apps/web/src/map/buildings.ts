import type * as maplibregl from "maplibre-gl";

export const BUILDINGS_LAYER = "buildings-3d";

/**
 * Extruded buildings from the basemap's own vector source, lit from the upper
 * left so faces read as volume. Flat building fills are hidden where the 3D
 * layer takes over.
 */
export function add3DBuildings(map: maplibregl.Map, beforeId?: string) {
  if (map.getLayer(BUILDINGS_LAYER)) return;
  const style = map.getStyle();
  const sources = style?.sources ?? {};
  const srcId = Object.keys(sources).find((k) => sources[k].type === "vector");
  if (!srcId) return;

  for (const l of style?.layers ?? []) {
    const srcLayer = "source-layer" in l ? l["source-layer"] : undefined;
    if (l.type === "fill" && srcLayer === "building") {
      map.setLayerZoomRange(l.id, 0, 14);
    }
  }

  map.setLight({
    anchor: "viewport",
    color: "#ffffff",
    intensity: 0.4,
    position: [1.15, 210, 30],
  });

  map.addLayer(
    {
      id: BUILDINGS_LAYER,
      type: "fill-extrusion",
      source: srcId,
      "source-layer": "building",
      minzoom: 14,
      paint: {
        "fill-extrusion-color": [
          "interpolate", ["linear"], ["coalesce", ["get", "render_height"], 6],
          0, "#17171a",
          40, "#232327",
          120, "#2f2f35",
          300, "#3b3b42",
        ],
        "fill-extrusion-height": [
          "interpolate", ["linear"], ["zoom"],
          14, 0,
          15.2, ["coalesce", ["get", "render_height"], 6],
        ],
        "fill-extrusion-base": [
          "interpolate", ["linear"], ["zoom"],
          14, 0,
          15.2, ["coalesce", ["get", "render_min_height"], 0],
        ],
        "fill-extrusion-opacity": 0.92,
        "fill-extrusion-vertical-gradient": true,
      },
    },
    beforeId,
  );
}
