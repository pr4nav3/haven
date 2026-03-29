import { supabase } from "../_shared/supabase.ts";
import type { AlertRow } from "../_shared/types.ts";

/**
 * Ingest active NWS alerts for Wisconsin.
 * Source: https://api.weather.gov/alerts/active?area=WI
 */

type NwsFeature = {
  id?: string;
  geometry?: Record<string, unknown> | null;
  properties?: {
    id?: string;
    event?: string;
    severity?: string;
    urgency?: string;
    headline?: string;
    description?: string;
    instruction?: string;
    areaDesc?: string;
    status?: string;
    onset?: string;
    expires?: string;
  };
};

Deno.serve(async (_req) => {
  try {
    const res = await fetch("https://api.weather.gov/alerts/active?area=WI", {
      headers: { "User-Agent": "Haven/2.0 (crisis-concierge)" },
    });
    if (!res.ok) throw new Error(`NWS API ${res.status}`);

    const data = (await res.json()) as { features?: NwsFeature[] };
    const rows: AlertRow[] = [];

    for (const f of data.features ?? []) {
      const p = f.properties ?? {};
      const id = f.id ?? p.id;
      if (!id) continue;

      // Skip test/exercise alerts
      if (p.status && p.status !== "Actual") continue;

      rows.push({
        id,
        event: p.event ?? "Unknown",
        severity: p.severity ?? null,
        urgency: p.urgency ?? null,
        headline: p.headline ?? null,
        description: p.description ?? null,
        instruction: p.instruction ?? null,
        area_desc: p.areaDesc ?? null,
        geometry: f.geometry ?? null,
        onset: p.onset ?? null,
        expires: p.expires ?? null,
        updated_at: new Date().toISOString(),
      });
    }

    if (rows.length) {
      const { error } = await supabase
        .from("alerts")
        .upsert(rows, { onConflict: "id" });
      if (error) throw error;
    }

    // Prune expired alerts
    await supabase.rpc("prune_expired_alerts");

    return new Response(
      JSON.stringify({ ok: true, upserted: rows.length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[ingest-nws-alerts]", msg);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
