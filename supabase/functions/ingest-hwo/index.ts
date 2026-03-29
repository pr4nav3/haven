import { supabase } from "../_shared/supabase.ts";
import type { HwoProductRow } from "../_shared/types.ts";

/**
 * Ingest Hazardous Weather Outlook from IEM AFOS.
 * WFOs covering Wisconsin: MKX (Milwaukee), ARX (La Crosse), GRB (Green Bay).
 */

const WI_WFOS = ["MKX", "ARX", "GRB"];

async function sha256hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

      const hash = (await sha256hex(text)).slice(0, 12);
      const id = `hwo:${wfo}:${hash}`;

      const row: HwoProductRow = {
        id,
        wfo,
        product_text: text,
        issued_at: new Date().toISOString(),
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
