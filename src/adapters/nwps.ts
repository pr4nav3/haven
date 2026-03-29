/**
 * National Water Prediction Service.
 * Stable gauge endpoint pattern: /nwps/v1/gauges/{NWSLI}, 
 * provides a comma-separated list in NWPS_GAUGE_IDS (e.g., MKXW3,MILW3,WATW3).
 */

// adapters/nwps.ts
import { supabase } from "../lib/supabase";
import { upsertRagWithEmbedding } from "../lib/rag";

type NwpsGauge = {
  id?: string;                 // NWSLI, e.g., "MKXW3"
  name?: string;
  state?: string;
  lat?: number;
  lon?: number;
  // Observations/forecast (shape inferred from current docs/examples; be defensive)
  latestObservation?: {
    stage?: number | null;     // feet
    flow?: number | null;      // cfs
    time?: string | null;      // ISO
    units?: { stage?: string; flow?: string } | null;
  } | null;
  forecast?: {
    peakTime?: string | null;
    peakStage?: number | null;
    peakFlow?: number | null;
    // optionally more points/series, ignored here for compactness
  } | null;
  flood?: {
    action?: number | null;
    flood?: number | null;
    moderate?: number | null;
    major?: number | null;
  } | null;
};

type GaugeRow = {
  nwsli: string;               // primary key for this table
  name: string | null;
  state: string | null;
  lat: number | null;
  lon: number | null;
  stage_ft: number | null;
  flow_cfs: number | null;
  observed_at: string | null;
  peak_stage_ft: number | null;
  peak_flow_cfs: number | null;
  peak_time: string | null;
  action_ft: number | null;
  flood_ft: number | null;
  moderate_ft: number | null;
  major_ft: number | null;
  source: "nwps";
  jurisdiction: string | null;  // state, typically
  last_seen_at: string;         // ISO
};

function parseGauge(json: any): NwpsGauge {
  // Accept partials; field names may evolve — keep it resilient.
  return {
    id: json?.id ?? json?.nwsli ?? json?.gaugeId,
    name: json?.name ?? json?.locationName ?? null,
    state: json?.state ?? null,
    lat: json?.lat ?? json?.latitude ?? null,
    lon: json?.lon ?? json?.longitude ?? null,
    latestObservation: json?.latestObservation ?? json?.observation ?? null,
    forecast: json?.forecast ?? null,
    flood: json?.flood ?? json?.floodStages ?? null,
  };
}

export async function ingestNWPS() {
  const ids = (process.env.NWPS_GAUGE_IDS ?? "")
    .split(",")
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);

  if (!ids.length) {
    console.log("[nwps] No NWPS_GAUGE_IDS provided; skipping.");
    return { upserted: 0, rag: 0, skipped: true };
  }

  const nowISO = new Date().toISOString();
  const rows: GaugeRow[] = [];

  for (const id of ids) {
    const url = `https://api.water.noaa.gov/nwps/v1/gauges/${encodeURIComponent(id)}`;
    const res = await fetch(url, { headers: { "User-Agent": "CrisisConcierge/1.0 (ingest@your.app)" } });
    if (!res.ok) {
      console.error(`[nwps] ${id} ${res.status}`);
      continue;
    }

    const g = parseGauge(await res.json());

    rows.push({
      nwsli: g.id ?? id,
      name: g.name ?? null,
      state: g.state ?? null,
      lat: g.lat ?? null,
      lon: g.lon ?? null,
      stage_ft: g.latestObservation?.stage ?? null,
      flow_cfs: g.latestObservation?.flow ?? null,
      observed_at: g.latestObservation?.time ?? null,
      peak_stage_ft: g.forecast?.peakStage ?? null,
      peak_flow_cfs: g.forecast?.peakFlow ?? null,
      peak_time: g.forecast?.peakTime ?? null,
      action_ft: g.flood?.action ?? null,
      flood_ft: g.flood?.flood ?? null,
      moderate_ft: g.flood?.moderate ?? null,
      major_ft: g.flood?.major ?? null,
      source: "nwps",
      jurisdiction: g.state ?? null,
      last_seen_at: nowISO,
    });
  }

  if (!rows.length) return { upserted: 0, rag: 0 };

  const { error: upErr } = await supabase
    .from("gauges_nwps")
    .upsert(rows, { onConflict: "nwsli" });
  if (upErr) throw upErr;

  for (const r of rows) {
    const obs = [
      r.stage_ft != null ? `stage ${r.stage_ft.toFixed(2)} ft` : null,
      r.flow_cfs != null ? `flow ${Math.round(r.flow_cfs)} cfs` : null,
    ].filter(Boolean).join(", ");

    const peak = r.peak_stage_ft != null ? ` (peak fcst ${r.peak_stage_ft.toFixed(2)} ft${r.peak_time ? ` @ ${r.peak_time}` : ""})` : "";

    const summary = `NWPS ${r.name ?? r.nwsli}${r.state ? `, ${r.state}` : ""}: ${obs}${peak}`;
    await upsertRagWithEmbedding({
      doc_id: `nwps:${r.nwsli}`,
      source: "nwps",
      jurisdiction: r.jurisdiction ?? undefined,
      lat: r.lat ?? undefined,
      lon: r.lon ?? undefined,
      published_at: r.observed_at ?? undefined,
      summary,
      raw: r,
    });
  }

  return { upserted: rows.length, rag: rows.length };
}
