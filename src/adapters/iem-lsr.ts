/**
 * NWS Local Storm Reports (via IEM). Real-time damage reports (hail size, wind damage, tornado 
 * sightings) with lat/lon. This answers “what actually happened” in the last few hours.
 * RAG: only writes impactful reports (TORNADO, wind damage, or HAIL ≥ 1.00").
 */

// adapters/iem-lsr.ts
import { supabase } from "../lib/supabase";
import { upsertRagWithEmbedding } from "../lib/rag";
import { createHash } from "crypto";

type LsrFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    wfo?: string; event?: string; magnitude?: string | number | null;
    city?: string | null; county?: string | null; state?: string | null;
    remark?: string | null; valid?: string | null; updated?: string | null;
  };
};

const IMPORTANT_EVENTS = new Set([
  // Severe convective
  "TORNADO","FUNNEL CLOUD","TSTM WND DMG","TSTM WND GST","HAIL",
  // Winter
  "HEAVY SNOW","BLIZZARD","ICE STORM","FREEZING RAIN","HEAVY SLEET","SNOW","WINTER STORM",
  // Flood
  "FLASH FLOOD","FLOOD","LAKESHORE FLOOD",
  // Wind
  "HIGH WIND","STRONG WIND",
  // Other
  "WILDFIRE","EXCESSIVE HEAT","COLD/WIND CHILL"
]);

const toISO = (s?: string | null) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const sha1 = (s: string) => createHash("sha1").update(s, "utf8").digest("hex");

function stableId(p: NonNullable<LsrFeature["properties"]>, lat: number | null, lon: number | null): string {
  // Hash the salient identity fields (NOT time-now), so repeated fetches match same ID.
  const payload = [
    p.wfo ?? "", p.event ?? "", p.magnitude ?? "",
    p.city ?? "", p.county ?? "", p.state ?? "",
    toISO(p.valid) ?? "", (lat ?? "").toString(), (lon ?? "").toString(),
    (p.remark ?? "").trim()
  ].join("|");
  return `lsr:${sha1(payload).slice(0,16)}`;
}

function isImpactful(ev?: string) {
  return ev ? IMPORTANT_EVENTS.has(ev.toUpperCase()) : false;
}

export async function ingestLSR() {
  const hours = Number(process.env.LSR_HOURS ?? 12);
  const url = `https://mesonet.agron.iastate.edu/geojson/lsr.geojson?states=WI&hours=${hours}`;
  const res = await fetch(url, { headers: { "User-Agent": "CrisisConcierge/1.0 (ingest@your.app)" } });
  if (!res.ok) throw new Error(`IEM LSR ${res.status}`);

  const fc = (await res.json()) as { features?: LsrFeature[] };
  const rows: any[] = [];
  const ragDocs: any[] = [];

  for (const f of fc.features ?? []) {
    const p = f.properties ?? {};
    const c = f.geometry?.coordinates ?? [null, null];
    const lon = typeof c[0] === "number" ? c[0] : null;
    const lat = typeof c[1] === "number" ? c[1] : null;

    const occurred_at = toISO(p.valid);
    const received_at = toISO(p.updated);

    const id = stableId(p, lat, lon);
    rows.push({
      id,
      wfo: p.wfo ?? null,
      type: p.event ?? null,
      magnitude: p.magnitude != null ? String(p.magnitude) : null,
      city: p.city ?? null,
      county: p.county ?? null,
      state: p.state ?? null,
      remark: p.remark ?? null,
      occurred_at, received_at, lat, lon,
      // optional content hash column (if you added it)
      // text_hash: sha256hex(JSON.stringify({ ...p, lat, lon, occurred_at })),
    });

    if (isImpactful(p.event)) {
      const parts = [
        p.event ?? "Report",
        p.magnitude != null ? `(magnitude ${p.magnitude})` : "",
        [p.city, p.county, p.state].filter(Boolean).join(", "),
        occurred_at ? `@ ${occurred_at}` : "",
        p.remark ? `— ${p.remark}` : ""
      ].filter(Boolean);
      const summary = parts.join(" ").replace(/\s+/g, " ").trim();

      ragDocs.push({
        doc_id: id, // same id; dedup-safe
        source: "lsr",
        jurisdiction: "WI",
        lat: lat ?? undefined,
        lon: lon ?? undefined,
        published_at: occurred_at ?? received_at ?? undefined,
        summary,
        raw: { ...p, lat, lon }
      });
    }
  }

  if (rows.length) {
    const { error } = await supabase.from("lsr_reports").upsert(rows, { onConflict: "id" });
    if (error) throw error;
  }

  for (const d of ragDocs) {
    await upsertRagWithEmbedding(d);
  }

  return { upserted: rows.length, rag: ragDocs.length };
}
