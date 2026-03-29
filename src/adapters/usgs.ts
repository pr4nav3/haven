/**
 * Pulls latest discharge (00060) and stream gage height (00065) for WI from 
 * waterservices.usgs.gov/nwis/iv/.
 */

// adapters/usgs.ts
import { supabase } from "../lib/supabase";
import { upsertRagWithEmbedding } from "../lib/rag";

/**
 * USGS Instantaneous Values response (subset).
 * Each timeSeries holds one parameter (e.g., 00060 discharge) for one site.
 */
type IvResponse = {
  value?: {
    timeSeries?: Array<{
      sourceInfo?: {
        siteName?: string;
        siteCode?: Array<{ value?: string }>;
        geoLocation?: { geogLocation?: { latitude?: number; longitude?: number } };
      };
      variable?: { variableCode?: Array<{ value?: string }>; variableName?: string };
      values?: Array<{ value?: Array<{ value?: string; dateTime?: string }> }>;
    }>;
  };
};

// Minimal row for a `gauges_usgs` table (adapt/extend to your schema).
type GaugeRow = {
  site_id: string;       // USGS site code
  site_name: string | null;
  lat: number | null;
  lon: number | null;
  gage_height_ft: number | null; // 00065
  discharge_cfs: number | null;  // 00060
  observed_at: string | null;    // ISO
  last_seen_at: string;          // ISO
  source: "usgs";
  jurisdiction: "WI";
};

export async function ingestUSGS() {
  const url =
    "https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd=wi&parameterCd=00060,00065&siteStatus=active";
  const res = await fetch(url, {
    headers: { "User-Agent": "CrisisConcierge/1.0 (ingest@your.app)" },
  });
  if (!res.ok) throw new Error(`USGS IV ${res.status}`);

  const data = (await res.json()) as IvResponse;
  const latestBySite: Record<
    string,
    {
      name: string | null;
      lat: number | null;
      lon: number | null;
      // keep latest sample per parameter
      "00060"?: { v: number; t: string };
      "00065"?: { v: number; t: string };
    }
  > = {};

  for (const ts of data.value?.timeSeries ?? []) {
    const site = ts.sourceInfo?.siteCode?.[0]?.value ?? "";
    if (!site) continue;

    const param = ts.variable?.variableCode?.[0]?.value as "00060" | "00065" | undefined;
    if (!param) continue;

    const name = ts.sourceInfo?.siteName ?? null;
    const lat = ts.sourceInfo?.geoLocation?.geogLocation?.latitude ?? null;
    const lon = ts.sourceInfo?.geoLocation?.geogLocation?.longitude ?? null;

    const vlist = ts.values?.[0]?.value ?? [];
    const latest = vlist[vlist.length - 1];
    if (!latest?.value || !latest?.dateTime) continue;

    const val = Number(latest.value);
    const t = new Date(latest.dateTime).toISOString();
    latestBySite[site] ??= { name, lat, lon };
    latestBySite[site][param] = { v: val, t };
  }

  const nowISO = new Date().toISOString();
  const rows: GaugeRow[] = Object.entries(latestBySite).map(([site, s]) => {
    // prefer a timestamp if any param provided one
    const observedAt = s["00060"]?.t ?? s["00065"]?.t ?? null;
    return {
      site_id: site,
      site_name: s.name ?? null,
      lat: s.lat ?? null,
      lon: s.lon ?? null,
      discharge_cfs: s["00060"]?.v ?? null,
      gage_height_ft: s["00065"]?.v ?? null,
      observed_at: observedAt,
      last_seen_at: nowISO,
      source: "usgs",
      jurisdiction: "WI",
    };
  });

  if (!rows.length) return { upserted: 0, rag: 0 };

  const { error: upErr } = await supabase
    .from("gauges_usgs")
    .upsert(rows, { onConflict: "site_id" });
  if (upErr) throw upErr;

  // RAG: one doc per site (upsert), compact summary
  for (const r of rows) {
    const parts = [];
    if (r.gage_height_ft != null) parts.push(`stage ${r.gage_height_ft.toFixed(2)} ft`);
    if (r.discharge_cfs != null) parts.push(`flow ${Math.round(r.discharge_cfs)} cfs`);
    const summary = `USGS ${r.site_name ?? r.site_id}: ${parts.join(", ")}${r.observed_at ? ` @ ${r.observed_at}` : ""}`;

    await upsertRagWithEmbedding({
      doc_id: `usgs:${r.site_id}`,
      source: "usgs",
      jurisdiction: r.jurisdiction,
      lat: r.lat ?? undefined,
      lon: r.lon ?? undefined,
      published_at: r.observed_at ?? undefined,
      summary,
      raw: r,
    });
  }

  return { upserted: rows.length, rag: rows.length };
}
