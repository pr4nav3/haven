// adapters/nws.ts
import { supabase } from "../lib/supabase";
import { setAlertGeomGeoJSON } from "../lib/geo";
import { upsertRagWithEmbedding } from "../lib/rag";
import type { AlertNwsInsert } from "../lib/types";

/**
 * Minimal shape of a feature returned by api.weather.gov/alerts.
 * We only read the fields we need.
 */
type NwsFeature = {
  id?: string;
  geometry?: unknown; // GeoJSON geometry
  properties?: {
    id?: string;
    event?: string;
    headline?: string;
    description?: string;
    severity?: string;
    status?: string;
    effective?: string;
    expires?: string;
    url?: string;
    ["@id"]?: string;
  };
};

/**
 * Ingest active NWS alerts for Wisconsin (FIPS area 'WI').
 * Source docs: https://api.weather.gov/ (alerts endpoint)  ← NWS Web API. 
 * (We include a UA per their guidance.)
 */
export async function ingestNWS() {
  const res = await fetch("https://api.weather.gov/alerts/active?area=WI", {
    headers: { "User-Agent": "CrisisConcierge/1.0 (alerts@your.app)" },
  });
  if (!res.ok) throw new Error(`NWS ${res.status}`);

  const data = (await res.json()) as { features?: NwsFeature[] };
  const rows: AlertNwsInsert[] = [];
  const rawById = new Map<string, NwsFeature>();
  const nowISO = new Date().toISOString();

  for (const f of data.features ?? []) {
    const p = f.properties ?? {};
    const id = (f.id ?? p.id)?.toString();
    if (!id) continue;

    rawById.set(id, f);

    const rawUrl = (p as any)["@id"] ?? p.url ?? p.id ?? null;

    rows.push({
      id,
      event: p.event ?? null,
      headline: p.headline ?? null,
      description: p.description ?? null,
      severity: p.severity ?? null,
      status: p.status ?? null,
      effective: p.effective ? new Date(p.effective).toISOString() : null,
      expires: p.expires ? new Date(p.expires).toISOString() : null,
      source: "nws",
      url: rawUrl ? String(rawUrl) : null,
      jurisdiction: "WI",
      last_seen_at: nowISO,
    });
  }

  if (!rows.length) return { upserted: 0, setGeom: 0, rag: 0 };

  // Upsert into alerts_nws
  const { error: upErr } = await supabase
    .from("alerts_nws")
    .upsert(rows, { onConflict: "id" });
  if (upErr) throw upErr;

  // Set geometry (via your existing RPC) + write a compact RAG summary
  let setGeom = 0;
  for (const r of rows) {
    const feat = rawById.get(r.id);

    if (feat?.geometry) {
      await setAlertGeomGeoJSON(r.id, feat.geometry);
      setGeom++;
    }

    await upsertRagWithEmbedding({
      doc_id: `nws:${r.id}`,
      source: "nws",
      url: r.url ?? undefined,
      published_at: r.effective ?? undefined,
      jurisdiction: r.jurisdiction ?? undefined,
      hazard_type: r.event ?? undefined,
      summary: `${r.event ?? "Alert"}${r.severity ? ` (${r.severity})` : ""}: ${r.headline ?? ""}`.trim(),
      raw: r,
    });
  }

  return { upserted: rows.length, setGeom, rag: rows.length };
}
