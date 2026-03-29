// adapters/shelters.ts
import { supabase } from "../lib/supabase";
import { upsertRagWithEmbedding } from "../lib/rag";

/**
 * ArcGIS REST: FEMA Open Shelters (layer 0).
 * Fields documented on the service page.
 */
type ShelterFeature = {
  attributes?: {
    shelter_id?: number;
    shelter_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    shelter_status?: string; // "Open"
    evacuation_capacity?: number | null;
    post_impact_capacity?: number | null;
    total_population?: number | null;
    org_name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  geometry?: { x?: number; y?: number }; // lon/lat in WGS84 per service info
};

type ArcGisQueryResp = { features?: ShelterFeature[] };

type ShelterRow = {
  id: string; // shelter_id as string
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string | null;
  capacity_evac: number | null;
  capacity_post: number | null;
  population: number | null;
  org_name: string | null;
  lat: number | null;
  lon: number | null;
  source: "fema_nss";
  jurisdiction: "WI";
  last_seen_at: string; // ISO
};

export async function ingestShelters() {
  const base = "https://gis.fema.gov/arcgis/rest/services/NSS/OpenShelters/MapServer/0/query";
  // Only open shelters in WI
  const where = encodeURIComponent("state='WI' AND shelter_status='Open'");
  const params =
    `where=${where}&outFields=shelter_id,shelter_name,address,city,state,zip,shelter_status,` +
    `evacuation_capacity,post_impact_capacity,total_population,org_name,latitude,longitude&` +
    `returnGeometry=true&f=json`;

  const res = await fetch(`${base}?${params}`, {
    headers: { "User-Agent": "CrisisConcierge/1.0 (ingest@your.app)" },
  });
  if (!res.ok) throw new Error(`FEMA Open Shelters ${res.status}`);

  const data = (await res.json()) as ArcGisQueryResp;
  const nowISO = new Date().toISOString();
  const rows: ShelterRow[] = [];

  for (const f of data.features ?? []) {
    const a = f.attributes ?? {};
    const id = a.shelter_id != null ? String(a.shelter_id) : undefined;
    if (!id) continue;

    const lat = a.latitude ?? (typeof f.geometry?.y === "number" ? f.geometry.y : null);
    const lon = a.longitude ?? (typeof f.geometry?.x === "number" ? f.geometry.x : null);

    rows.push({
      id,
      name: a.shelter_name ?? null,
      address: a.address ?? null,
      city: a.city ?? null,
      state: a.state ?? null,
      zip: a.zip ?? null,
      status: a.shelter_status ?? null,
      capacity_evac: a.evacuation_capacity ?? null,
      capacity_post: a.post_impact_capacity ?? null,
      population: a.total_population ?? null,
      org_name: a.org_name ?? null,
      lat: lat ?? null,
      lon: lon ?? null,
      source: "fema_nss",
      jurisdiction: "WI",
      last_seen_at: nowISO,
    });
  }

  if (!rows.length) return { upserted: 0, rag: 0 };

  const { error: upErr } = await supabase
    .from("shelters_open")
    .upsert(rows, { onConflict: "id" });
  if (upErr) throw upErr;

  for (const r of rows) {
    const summary = `Open shelter: ${r.name ?? "Unnamed"} — ${[r.city, r.state].filter(Boolean).join(", ")}`
      + (r.population != null ? ` (population ${r.population})` : "");

    await upsertRagWithEmbedding({
      doc_id: `shelter:${r.id}`,
      source: "fema_nss",
      jurisdiction: r.jurisdiction,
      lat: r.lat ?? undefined,
      lon: r.lon ?? undefined,
      summary,
      raw: r,
    });
  }

  return { upserted: rows.length, rag: rows.length };
}
