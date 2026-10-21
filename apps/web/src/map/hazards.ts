import type * as maplibregl from "maplibre-gl";

const SRC = "hazards";
const FILL = "hazards-fill";
const LINE = "hazards-line";

const EMPTY: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

const SEVERE = ["Extreme", "Severe"];

/** Alert polygons: low-opacity tint, thin edge, so streets stay readable underneath. */
export function addHazardLayers(map: maplibregl.Map, beforeId?: string) {
  if (map.getSource(SRC)) return;
  map.addSource(SRC, { type: "geojson", data: EMPTY });
  map.addLayer(
    {
      id: FILL,
      type: "fill",
      source: SRC,
      paint: {
        "fill-color": ["case", ["in", ["get", "severity"], ["literal", SEVERE]], "#f2567a", "#f19b6e"],
        "fill-opacity": ["case", ["in", ["get", "severity"], ["literal", SEVERE]], 0.16, 0.12],
      },
    },
    beforeId,
  );
  map.addLayer(
    {
      id: LINE,
      type: "line",
      source: SRC,
      paint: {
        "line-color": ["case", ["in", ["get", "severity"], ["literal", SEVERE]], "#f2567a", "#f19b6e"],
        "line-width": 1.2,
        "line-opacity": 0.7,
      },
    },
    beforeId,
  );
}

export function setHazards(map: maplibregl.Map, fc: GeoJSON.FeatureCollection) {
  (map.getSource(SRC) as maplibregl.GeoJSONSource | undefined)?.setData(fc);
}
