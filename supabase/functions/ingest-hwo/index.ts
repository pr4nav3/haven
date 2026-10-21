import { supabase } from "../_shared/supabase.ts";
import type { HwoProductRow } from "../_shared/types.ts";

/**
 * Ingest Hazardous Weather Outlook from IEM AFOS.
 * WFOs covering Wisconsin: MKX (Milwaukee), ARX (La Crosse), GRB (Green Bay).
 */

const WI_WFOS = ["MKX", "ARX", "GRB"];

/**
 * Parse the issue time from an AFOS product header. Two sources, in order:
 *   1. The local-time line, e.g. "140 PM CDT Wed Oct 21 2026" (full date).
 *   2. The WMO line, e.g. "FLUS43 KMKX 211840" (DDHHMM UTC; month/year
 *      inferred from `now`, rolling back a month if the day is in the future).
 * Returns null if neither parses.
 */
export function parseIssuedAt(text: string, now = new Date()): Date | null {
  const head = text.split("\n").slice(0, 15).map((l) => l.trim());

  const months: Record<string, number> = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
  };
  // Offsets in hours for the zones NWS uses in these products.
  const tz: Record<string, number> = {
    EST: -5, EDT: -4, CST: -6, CDT: -5, MST: -7, MDT: -6,
    PST: -8, PDT: -7, AKST: -9, AKDT: -8, HST: -10,
  };

  for (const line of head) {
    const m = line.match(
      /^(\d{1,2})(\d{2})\s+(AM|PM)\s+([A-Z]{3,4})\s+[A-Za-z]{3}\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})$/i,
    );
    if (!m) continue;
    let hour = Number(m[1]) % 12;
    if (m[3].toUpperCase() === "PM") hour += 12;
    const minute = Number(m[2]);
    const offset = tz[m[4].toUpperCase()];
    const month = months[m[5].toUpperCase()];
    if (offset === undefined || month === undefined) continue;
    const utc = Date.UTC(Number(m[7]), month, Number(m[6]), hour - offset, minute);
    if (!Number.isNaN(utc)) return new Date(utc);
  }

  for (const line of head) {
    const m = line.match(/^[A-Z]{4}\d{2}\s+K[A-Z]{3}\s+(\d{2})(\d{2})(\d{2})$/);
    if (!m) continue;
    const day = Number(m[1]), hour = Number(m[2]), minute = Number(m[3]);
    let y = now.getUTCFullYear(), mo = now.getUTCMonth();
    if (day > now.getUTCDate()) {
      mo -= 1;
      if (mo < 0) { mo = 11; y -= 1; }
    }
    const utc = Date.UTC(y, mo, day, hour, minute);
    if (!Number.isNaN(utc)) return new Date(utc);
  }

  return null;
}

Deno.serve(async (_req) => {
  try {
    let upserted = 0;

    for (const wfo of WI_WFOS) {
      const url = `https://mesonet.agron.iastate.edu/cgi-bin/afos/retrieve.py?pil=HWO${wfo}&fmt=text&limit=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Haven/2.0 (crisis-concierge)" },
      });
      if (!res.ok) {
        console.error(`[ingest-hwo] ${wfo} ${res.status}`);
        continue;
      }

      const text = (await res.text()).trim();
      if (!text) continue;

      // One row per (WFO, issuance). Re-fetching the same product is a no-op
      // upsert instead of a duplicate row.
      const issuedAt = parseIssuedAt(text);
      if (!issuedAt) {
        console.error(`[ingest-hwo] ${wfo}: could not parse issue time, skipping`);
        continue;
      }
      const id = `hwo:${wfo}:${issuedAt.toISOString()}`;

      const row: HwoProductRow = {
        id,
        wfo,
        product_text: text,
        issued_at: issuedAt.toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("hwo_products")
        .upsert([row], { onConflict: "id" });
      if (error) throw error;
      upserted++;
    }

    // Prune old HWO products
    await supabase.rpc("prune_old_hwo");

    return new Response(
      JSON.stringify({ ok: true, upserted }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[ingest-hwo]", msg);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
