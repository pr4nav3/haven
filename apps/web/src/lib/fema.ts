import type { Shelter } from "./shelters";

/**
 * FEMA National Shelter System, open shelters in Wisconsin, fetched directly
 * from the ArcGIS REST endpoint. Usually empty outside declared disasters.
 */

const URL_ =
  "https://gis.fema.gov/arcgis/rest/services/NSS/OpenShelters/MapServer/0/query" +
  "?where=" + encodeURIComponent("state='WI' AND shelter_status='Open'") +
  "&outFields=shelter_id,shelter_name,address,city,state,zip,evacuation_capacity,latitude,longitude" +
  "&returnGeometry=false&f=json";

type Attr = {
  shelter_id?: number;
  shelter_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  evacuation_capacity?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

type Row = Omit<Shelter, "distanceMi">;

let cache: { at: number; rows: Row[] } | null = null;
const TTL_MS = 10 * 60 * 1000;

export async function femaOpenShelters(): Promise<Row[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(URL_, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`FEMA ${res.status}`);
    const json = (await res.json()) as { features?: Array<{ attributes?: Attr }> };
    const rows: Row[] = [];
    for (const f of json.features ?? []) {
      const a = f.attributes ?? {};
      if (a.shelter_id == null || a.latitude == null || a.longitude == null) continue;
      rows.push({
        id: `fema:${a.shelter_id}`,
        name: a.shelter_name ?? "Emergency shelter",
        type: "fema",
        address: [a.address, a.city, a.zip].filter(Boolean).join(", ") || null,
        phone: null,
        hours: { raw: "Open now", is_24_7: true },
        amenities: ["open_24h"],
        lng: a.longitude,
        lat: a.latitude,
      });
    }
    cache = { at: Date.now(), rows };
    return rows;
  } catch {
    cache = { at: Date.now(), rows: cache?.rows ?? [] };
    return cache.rows;
  }
}
