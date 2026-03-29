import { supabase } from "../_shared/supabase.ts";
import type { ShelterRow } from "../_shared/types.ts";

/**
 * Ingest FEMA open shelters for Wisconsin.
 * Source: FEMA National Shelter System ArcGIS service.
 */

type ShelterFeature = {
  attributes?: {
    shelter_id?: number;
    shelter_name?: string;
    address?: string;
    city?: string;
    state?: string;
    shelter_status?: string;
    evacuation_capacity?: number | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  geometry?: { x?: number; y?: number };
};

Deno.serve(async (_req) => {
  try {
    const base =
      "https://gis.fema.gov/arcgis/rest/services/NSS/OpenShelters/MapServer/0/query";
    const where = encodeURIComponent(
      "state='WI' AND shelter_status='Open'",
    );
    const params =
      `where=${where}&outFields=shelter_id,shelter_name,address,city,state,shelter_status,` +
      `evacuation_capacity,latitude,longitude&returnGeometry=true&f=json`;

    const res = await fetch(`${base}?${params}`, {
      headers: { "User-Agent": "Haven/2.0 (crisis-concierge)" },
    });
    if (!res.ok) throw new Error(`FEMA API ${res.status}`);

    const data = (await res.json()) as { features?: ShelterFeature[] };
    const rows: ShelterRow[] = [];
    const ingestedIds: string[] = [];

    for (const f of data.features ?? []) {
      const a = f.attributes ?? {};
      if (a.shelter_id == null) continue;

      const lat = a.latitude ?? f.geometry?.y ?? null;
      const lng = a.longitude ?? f.geometry?.x ?? null;
      if (lat == null || lng == null) continue;

      const id = `fema:${a.shelter_id}`;
      ingestedIds.push(id);

      rows.push({
        id,
        name: a.shelter_name ?? "FEMA Shelter",
        type: "fema",
        source: "fema_arcgis",
        address: [a.address, a.city, a.state].filter(Boolean).join(", "),
        lat,
        lng,
        capacity: a.evacuation_capacity ?? null,
        is_open: true,
        hours: null,
        phone: null,
        amenities: [],
        last_verified: new Date().toISOString(),
      });
    }

    if (rows.length) {
      const { error } = await supabase.from("shelters").upsert(rows, {
        onConflict: "id",
      });
      if (error) throw error;
    }

    // Mark FEMA shelters not in the current feed as closed
    if (ingestedIds.length) {
      await supabase
        .from("shelters")
        .update({ is_open: false })
        .eq("source", "fema_arcgis")
        .not("id", "in", `(${ingestedIds.join(",")})`);
    } else {
      // No open shelters in feed — mark all FEMA shelters closed
      await supabase
        .from("shelters")
        .update({ is_open: false })
        .eq("source", "fema_arcgis");
    }

    return new Response(
      JSON.stringify({ ok: true, upserted: rows.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[ingest-fema-shelters]", msg);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
