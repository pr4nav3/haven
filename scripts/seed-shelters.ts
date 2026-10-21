/**
 * Seed the `shelters` table with always-open "safe places" in Wisconsin from
 * OpenStreetMap via the Overpass API: libraries, community centers, fire
 * stations, hospitals, town halls, weather shelters and 24/7 stores.
 *
 * FEMA disaster shelters are ingested separately by an Edge Function; this
 * script gives the app something to route to on an ordinary day.
 *
 * Usage:
 *   npm run seed:shelters          # fetch, write data/shelters-wi.geojson, upsert
 *   npm run seed:shelters:dry      # fetch and write the GeoJSON only
 *   tsx scripts/seed-shelters.ts --from-file   # upsert from the saved GeoJSON
 *
 * Env (root .env): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OUT_FILE = "data/shelters-wi.geojson";
const SOURCE = "osm_seed";
const USER_AGENT = "Haven/2.0 (crisis-concierge seed script)";

// ---------- types ----------

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type ShelterRow = {
  id: string;
  name: string;
  type: string;
  source: string;
  address: string | null;
  lat: number;
  lng: number;
  capacity: number | null;
  is_open: boolean;
  hours: Record<string, unknown> | null;
  phone: string | null;
  amenities: string[];
  last_verified: string;
  updated_at: string;
};

type Feature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: Omit<ShelterRow, "lat" | "lng">;
};

// ---------- overpass ----------

const QUERY = `
[out:json][timeout:180];
area["ISO3166-2"="US-WI"]->.wi;
(
  nwr["amenity"="library"](area.wi);
  nwr["amenity"="community_centre"](area.wi);
  nwr["amenity"="fire_station"](area.wi);
  nwr["amenity"="hospital"](area.wi);
  nwr["amenity"="townhall"](area.wi);
  nwr["amenity"="shelter"]["shelter_type"="weather_shelter"](area.wi);
  nwr["shop"~"^(supermarket|convenience)$"]["opening_hours"="24/7"](area.wi);
);
out center tags;
`;

async function fetchOverpass(): Promise<OsmElement[]> {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "data=" + encodeURIComponent(QUERY),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { elements?: OsmElement[] };
  return json.elements ?? [];
}

// ---------- mapping ----------

function classify(t: Record<string, string>): string | null {
  switch (t.amenity) {
    case "library": return "library";
    case "community_centre": return "community_center";
    case "fire_station": return "fire_station";
    case "hospital": return "hospital";
    case "townhall": return "town_hall";
    case "shelter": return "weather_shelter";
  }
  if (t.shop && t.opening_hours === "24/7") return "24hr_business";
  return null;
}

const DEFAULT_NAMES: Record<string, string> = {
  fire_station: "Fire Station",
  weather_shelter: "Weather Shelter",
  town_hall: "Town Hall",
};

function buildAddress(t: Record<string, string>): string | null {
  const street = [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" ");
  const parts = [street, t["addr:city"], t["addr:postcode"]].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function buildHours(t: Record<string, string>): Record<string, unknown> | null {
  const raw = t.opening_hours;
  if (!raw) return null;
  return { raw, is_24_7: raw.trim() === "24/7" };
}

function buildAmenities(t: Record<string, string>): string[] {
  const out = new Set<string>();
  if (t.opening_hours?.trim() === "24/7") out.add("open_24h");
  if (t.wheelchair === "yes" || t.wheelchair === "limited") out.add("wheelchair");
  if (t.internet_access && t.internet_access !== "no") out.add("wifi");
  if (t.toilets === "yes" || t.amenity === "library" || t.amenity === "hospital") out.add("restrooms");
  if (t.drinking_water === "yes") out.add("water");
  if (t.emergency === "yes") out.add("emergency");
  return [...out].sort();
}

function toRow(el: OsmElement, now: string): ShelterRow | null {
  const t = el.tags ?? {};
  const type = classify(t);
  if (!type) return null;

  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;

  const name = t.name?.trim() || DEFAULT_NAMES[type];
  if (!name) return null; // unnamed library/store: not useful to route to

  // Skip things explicitly flagged as not usable.
  if (t.access === "private" || t.disused === "yes" || t.abandoned === "yes") return null;

  return {
    id: `osm:${el.type}/${el.id}`,
    name,
    type,
    source: SOURCE,
    address: buildAddress(t),
    lat,
    lng,
    capacity: null,
    is_open: true,
    hours: buildHours(t),
    phone: t.phone ?? t["contact:phone"] ?? null,
    amenities: buildAmenities(t),
    last_verified: now,
    updated_at: now,
  };
}

function toFeature(r: ShelterRow): Feature {
  const { lat, lng, ...properties } = r;
  return { type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties };
}

function fromFeature(f: Feature): ShelterRow {
  const [lng, lat] = f.geometry.coordinates;
  return { ...f.properties, lat, lng };
}

// ---------- upsert ----------

async function upsertRows(rows: ShelterRow[]) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const BATCH = 500;
  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("shelters").upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`upsert batch ${i / BATCH + 1}: ${error.message}`);
    done += batch.length;
    console.log(`  upserted ${done}/${rows.length}`);
  }

  // Seeded places that vanished from OSM since the last run are closed, not deleted,
  // so the id stays stable if they reappear.
  const ids = rows.map((r) => r.id);
  const { error } = await supabase
    .from("shelters")
    .update({ is_open: false, updated_at: new Date().toISOString() })
    .eq("source", SOURCE)
    .not("id", "in", `(${ids.map((id) => `"${id}"`).join(",")})`);
  if (error) console.warn(`  could not close stale rows: ${error.message}`);
}

// ---------- main ----------

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const fromFile = args.has("--from-file");
  const now = new Date().toISOString();

  let rows: ShelterRow[];

  if (fromFile) {
    console.log(`Reading ${OUT_FILE} ...`);
    const fc = JSON.parse(await readFile(OUT_FILE, "utf8")) as { features: Feature[] };
    rows = fc.features.map(fromFeature);
  } else {
    console.log("Querying Overpass for Wisconsin safe places ...");
    const elements = await fetchOverpass();
    console.log(`  ${elements.length} raw elements`);

    const seen = new Set<string>();
    rows = [];
    for (const el of elements) {
      const row = toRow(el, now);
      if (!row || seen.has(row.id)) continue;
      seen.add(row.id);
      rows.push(row);
    }

    await mkdir("data", { recursive: true });
    const fc = { type: "FeatureCollection", features: rows.map(toFeature) };
    await writeFile(OUT_FILE, JSON.stringify(fc));
    console.log(`  wrote ${rows.length} features to ${OUT_FILE}`);
  }

  const byType = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {});
  console.table(byType);

  if (dryRun) {
    console.log("Dry run: not writing to Supabase.");
    return;
  }

  console.log("Upserting to Supabase ...");
  await upsertRows(rows);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
