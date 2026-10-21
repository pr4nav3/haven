import { haversineMi, type LngLat } from "./geo";
import { supabase } from "./supabase";
import { femaOpenShelters } from "./fema";

export type ShelterType =
  | "fema"
  | "library"
  | "hospital"
  | "community_center"
  | "fire_station"
  | "town_hall"
  | "weather_shelter"
  | "24hr_business";

export type Shelter = {
  id: string;
  name: string;
  type: ShelterType;
  address: string | null;
  phone: string | null;
  hours: { raw?: string; is_24_7?: boolean } | null;
  amenities: string[];
  lng: number;
  lat: number;
  distanceMi: number;
};

export const TYPE_LABEL: Record<ShelterType, string> = {
  fema: "Emergency shelter",
  library: "Public library",
  hospital: "Hospital",
  community_center: "Community center",
  fire_station: "Fire station",
  town_hall: "Town hall",
  weather_shelter: "Weather shelter",
  "24hr_business": "Open 24 hours",
};

/**
 * Ranking penalty in miles. A library half a mile further than a town hall
 * is the better answer: it is staffed, heated and open to the public.
 */
const TYPE_PENALTY_MI: Record<ShelterType, number> = {
  fema: -1.0,
  library: 0,
  hospital: 0,
  "24hr_business": 0,
  community_center: 0.5,
  weather_shelter: 0.5,
  fire_station: 1.0,
  town_hall: 1.5,
};

type Feature = {
  geometry: { coordinates: LngLat };
  properties: Omit<Shelter, "lng" | "lat" | "distanceMi">;
};

let localCache: Promise<Feature[]> | null = null;

export function loadLocalShelters(): Promise<Feature[]> {
  if (!localCache) {
    localCache = fetch("/data/shelters-wi.geojson")
      .then((r) => r.json())
      .then((fc: { features: Feature[] }) => fc.features);
  }
  return localCache;
}

export async function nearestShelters(
  at: LngLat,
  limit = 3,
  maxMi = 10,
): Promise<Shelter[]> {
  if (supabase) {
    const { data, error } = await supabase.rpc("nearest_shelters", {
      p_lat: at[1],
      p_lng: at[0],
      p_limit: 25,
      p_max_mi: maxMi,
    });
    if (!error && data) {
      const rows = (data as Array<Record<string, unknown>>).map(
        (r): Shelter => ({
          id: r.id as string,
          name: r.name as string,
          type: r.type as ShelterType,
          address: (r.address as string) ?? null,
          phone: (r.phone as string) ?? null,
          hours: (r.hours as Shelter["hours"]) ?? null,
          amenities: (r.amenities as string[]) ?? [],
          lng: r.lng as number,
          lat: r.lat as number,
          distanceMi: r.distance_mi as number,
        }),
      );
      return rank(rows).slice(0, limit);
    }
  }

  const [features, fema] = await Promise.all([loadLocalShelters(), femaOpenShelters()]);
  const rows: Shelter[] = [];
  for (const f of features) {
    const [lng, lat] = f.geometry.coordinates;
    const d = haversineMi(at, [lng, lat]);
    if (d > maxMi) continue;
    rows.push({ ...f.properties, lng, lat, distanceMi: d });
  }
  // Live FEMA shelters, when any are open, outrank everything nearby.
  for (const s of fema) {
    const d = haversineMi(at, [s.lng, s.lat]);
    if (d > maxMi) continue;
    rows.push({ ...s, distanceMi: d });
  }
  return rank(rows).slice(0, limit);
}

function rank(rows: Shelter[]): Shelter[] {
  return rows.sort(
    (a, b) =>
      a.distanceMi + (TYPE_PENALTY_MI[a.type] ?? 0) -
      (b.distanceMi + (TYPE_PENALTY_MI[b.type] ?? 0)),
  );
}
