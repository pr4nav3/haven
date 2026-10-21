import type { LngLat } from "./geo";

/**
 * Direct National Weather Service client. api.weather.gov allows cross-origin
 * requests, so the app can show live alerts with no backend at all.
 */

export type NwsAlertFeature = {
  id: string;
  geometry: GeoJSON.Geometry | null;
  properties: {
    id?: string;
    event: string;
    headline?: string | null;
    description?: string | null;
    instruction?: string | null;
    severity?: string | null;
    urgency?: string | null;
    status?: string;
    expires?: string | null;
    areaDesc?: string | null;
  };
};

const BASE = "https://api.weather.gov/alerts/active";
const HEADERS = { Accept: "application/geo+json" };

async function get(url: string): Promise<NwsAlertFeature[]> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`NWS ${res.status}`);
  const json = (await res.json()) as { features?: NwsAlertFeature[] };
  return (json.features ?? []).filter((f) => !f.properties.status || f.properties.status === "Actual");
}

/** Alerts whose zone or polygon contains the point. */
export function nwsAlertsAtPoint(at: LngLat): Promise<NwsAlertFeature[]> {
  return get(`${BASE}?point=${at[1].toFixed(4)},${at[0].toFixed(4)}`);
}

/** All active Wisconsin alerts that carry a polygon, for the hazard overlay. */
export async function nwsStateHazards(): Promise<GeoJSON.FeatureCollection> {
  const features = await get(`${BASE}?area=WI`);
  return {
    type: "FeatureCollection",
    features: features
      .filter((f) => f.geometry)
      .map((f) => ({
        type: "Feature",
        geometry: f.geometry as GeoJSON.Geometry,
        properties: {
          id: f.id,
          event: f.properties.event,
          severity: f.properties.severity ?? null,
        },
      })),
  };
}
