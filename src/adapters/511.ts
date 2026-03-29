/**
 * 511 road closures and traffic events official api. Api key needed.
 */

// src/adapters/511.ts
import { supabase } from "../lib/supabase";
import { upsertRagWithEmbedding } from "../lib/rag";

type W511Event = {
  ID?: string;
  EventType?: string;          // accidentsAndIncidents, roadwork, closures, weather, etc.
  EventSubType?: string | null;
  EventStatus?: string | null; // ACTIVE, INACTIVE, etc. (varies)
  RoadwayName?: string | null;
  DirectionOfTravel?: string | null;
  CountyName?: string | null;
  CityName?: string | null;
  Latitude?: number | null;
  Longitude?: number | null;
  Description?: string | null;
  StartDate?: string | null;   // may be ISO or dd/MM/yyyy HH:mm:ss
  PlannedEndDate?: string | null;
  LastUpdated?: string | null;
  Url?: string | null;
};

function toISO(s?: string | null): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  // fallback for dd/MM/yyyy HH:mm:ss variants
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (m) {
    const [, dd, MM, yyyy, hh, mm, ss] = m;
    const iso = `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}Z`;
    const d2 = new Date(iso);
    if (!Number.isNaN(d2.getTime())) return d2.toISOString();
  }
  return null;
}

// Decide if an event is high-value for crisis routing
function isHighValue(ev: W511Event): boolean {
  const t = (ev.EventType ?? "").toLowerCase();
  const sub = (ev.EventSubType ?? "").toLowerCase();
  const desc = (ev.Description ?? "").toLowerCase();

  // Hard closures
  if (t.includes("closure") || sub.includes("closure") || desc.includes("closed")) return true;

  // Big accidents / incidents that usually block roads
  if (t.includes("accident") || t.includes("incident")) {
    if (desc.includes("closure") || desc.includes("all lanes") || desc.includes("blocked")) return true;
  }

  // Severe weather impacts to roads
  if (t.includes("weather")) {
    if (desc.includes("flood") || desc.includes("water over") || desc.includes("impassable")) return true;
  }

  // Construction with closure impact
  if (t.includes("roadwork") && (desc.includes("closure") || desc.includes("detour"))) return true;

  return false;
}

export async function ingest511() {
  const key = process.env.API_KEY_511;
  if (!key) throw new Error("Missing API_KEY_511");

  const url = `https://511wi.gov/api/getevents?key=${encodeURIComponent(key)}&format=json`;
  const res = await fetch(url, {
    headers: { "User-Agent": "CrisisConcierge/1.0 (ingest@your.app)" },
  });
  if (!res.ok) throw new Error(`511WI ${res.status}`);

  const list = (await res.json()) as W511Event[];
  const nowISO = new Date().toISOString();

  // Parse and normalize
  const rows: Array<{
    id: string;
    type: string | null;
    subtype: string | null;
    roadway: string | null;
    direction: string | null;
    county: string | null;
    city: string | null;
    lat: number | null;
    lon: number | null;
    description: string | null;
    started_at: string | null;
    ends_at: string | null;
    last_updated: string | null;
    url: string | null;
    last_seen_at: string;
    source: "511wi";
    jurisdiction: "WI";
  }> = [];

  const ragSummaries: {
    doc_id: string;
    source: "511wi";
    summary: string;
    url?: string;
    published_at?: string;
    jurisdiction?: string;
    lat?: number;
    lon?: number;
    raw: any;
  }[] = [];

  for (const e of list ?? []) {
    const id = e.ID?.toString();
    if (!id) continue;

    const row = {
      id,
      type: e.EventType ?? null,
      subtype: e.EventSubType ?? null,
      roadway: e.RoadwayName ?? null,
      direction: e.DirectionOfTravel ?? null,
      county: e.CountyName ?? null,
      city: e.CityName ?? null,
      lat: e.Latitude ?? null,
      lon: e.Longitude ?? null,
      description: e.Description ?? null,
      started_at: toISO(e.StartDate),
      ends_at: toISO(e.PlannedEndDate),
      last_updated: toISO(e.LastUpdated),
      url: e.Url ?? null,
      last_seen_at: nowISO,
      source: "511wi" as const,
      jurisdiction: "WI" as const,
    };

    rows.push(row);

    if (isHighValue(e)) {
      const title = `${row.type ?? "event"}${row.subtype ? `/${row.subtype}` : ""} on ${row.roadway ?? "road"}`;
      const loc = [row.city, row.county].filter(Boolean).join(", ");
      const when = row.started_at ? ` since ${row.started_at}` : row.last_updated ? ` as of ${row.last_updated}` : "";
      const summary =
        `${title}${loc ? `, ${loc}` : ""}${when}` +
        (row.description ? ` — ${row.description}` : "");

      ragSummaries.push({
        doc_id: `511:${row.id}`, // stable doc id to avoid dupes
        source: "511wi",
        summary,
        url: row.url ?? undefined,
        published_at: row.started_at ?? row.last_updated ?? undefined,
        jurisdiction: "WI",
        lat: row.lat ?? undefined,
        lon: row.lon ?? undefined,
        raw: row,
      });
    }
  }

  if (rows.length) {
    const { error } = await supabase.from("roads_511").upsert(rows, { onConflict: "id" });
    if (error) throw error;
  }

  for (const d of ragSummaries) {
    await upsertRagWithEmbedding(d);
  }

  return { upserted: rows.length, rag: ragSummaries.length };
}
