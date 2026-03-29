import { supabase } from "../_shared/supabase.ts";
import type { StormReportRow } from "../_shared/types.ts";

/**
 * Ingest IEM Local Storm Reports for Wisconsin.
 * Source: https://mesonet.agron.iastate.edu/geojson/lsr.geojson
 */

type LsrFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    wfo?: string;
    event?: string;
    magnitude?: string | number | null;
    city?: string | null;
    county?: string | null;
    state?: string | null;
    remark?: string | null;
    valid?: string | null;
  };
};

// Only ingest significant weather events
const IMPORTANT_EVENTS = new Set([
  "TORNADO", "FUNNEL CLOUD", "TSTM WND DMG", "TSTM WND GST", "HAIL",
  "HEAVY SNOW", "BLIZZARD", "ICE STORM", "FREEZING RAIN", "HEAVY SLEET",
  "SNOW", "WINTER STORM",
  "FLASH FLOOD", "FLOOD", "LAKESHORE FLOOD",
  "HIGH WIND", "STRONG WIND",
  "WILDFIRE", "EXCESSIVE HEAT", "COLD/WIND CHILL",
]);

function toISO(s?: string | null): string | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function sha1hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-1", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (_req) => {
  try {
    const hours = 12;
    const url = `https://mesonet.agron.iastate.edu/geojson/lsr.geojson?states=WI&hours=${hours}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Haven/2.0 (crisis-concierge)" },
    });
    if (!res.ok) throw new Error(`IEM LSR ${res.status}`);

    const fc = (await res.json()) as { features?: LsrFeature[] };
    const rows: StormReportRow[] = [];
    let skipped = 0;

    for (const f of fc.features ?? []) {
      const p = f.properties ?? {};

      // Filter to important events only
      if (!p.event || !IMPORTANT_EVENTS.has(p.event.toUpperCase())) {
        skipped++;
        continue;
      }

      const coords = f.geometry?.coordinates ?? [null, null];
      const lng = typeof coords[0] === "number" ? coords[0] : null;
      const lat = typeof coords[1] === "number" ? coords[1] : null;

      const payload = [
        p.wfo ?? "", p.event ?? "", String(p.magnitude ?? ""),
        p.city ?? "", p.county ?? "", p.state ?? "",
        toISO(p.valid) ?? "", String(lat ?? ""), String(lng ?? ""),
      ].join("|");

      const hash = (await sha1hex(payload)).slice(0, 16);
      const id = `lsr:${hash}`;

      rows.push({
        id,
        event_type: p.event ?? "Unknown",
        magnitude: p.magnitude != null ? String(p.magnitude) : null,
        lat,
        lng,
        city: p.city ?? null,
        county: p.county ?? null,
        reported_at: toISO(p.valid),
        source: p.wfo ?? null,
        remark: p.remark ?? null,
        updated_at: new Date().toISOString(),
      });
    }

    if (rows.length) {
      const { error } = await supabase
        .from("storm_reports")
        .upsert(rows, { onConflict: "id" });
      if (error) throw error;
    }

    // Prune old storm reports
    await supabase.rpc("prune_old_storm_reports");

    return new Response(
      JSON.stringify({ ok: true, upserted: rows.length, skipped }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[ingest-storm-reports]", msg);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
