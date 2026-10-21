import type { LngLat } from "./geo";
import { supabase } from "./supabase";
import { nwsAlertsAtPoint } from "./nws";

export type Tier = "advisory" | "warning" | "take_action";

export type Alert = {
  id: string;
  event: string;
  headline: string | null;
  instruction: string | null;
  severity: string | null;
  expires: string | null;
  tier: Tier;
};

export function tierOf(event: string, severity: string | null): Tier {
  const e = event.toLowerCase();
  if (e.includes("emergency") || severity === "Extreme") return "take_action";
  if (e.includes("warning")) return "warning";
  return "advisory";
}

const TIER_RANK: Record<Tier, number> = { advisory: 0, warning: 1, take_action: 2 };

function pickTop(alerts: Alert[]): Alert | null {
  alerts.sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier]);
  return alerts[0] ?? null;
}

/**
 * Highest-tier active alert at a point. Uses Supabase when configured,
 * otherwise asks the NWS directly. Never throws; null means "no alert or
 * could not check".
 */
export async function alertAt(at: LngLat): Promise<Alert | null> {
  try {
    if (supabase) {
      const { data, error } = await supabase.rpc("alerts_at_point", {
        p_lat: at[1],
        p_lng: at[0],
        p_include_zone_alerts: true,
      });
      if (error || !data) return null;
      return pickTop(
        (data as Array<Record<string, unknown>>).map((r) => ({
          id: r.id as string,
          event: r.event as string,
          headline: (r.headline as string) ?? null,
          instruction: (r.instruction as string) ?? null,
          severity: (r.severity as string) ?? null,
          expires: (r.expires as string) ?? null,
          tier: tierOf(r.event as string, (r.severity as string) ?? null),
        })),
      );
    }

    const features = await nwsAlertsAtPoint(at);
    return pickTop(
      features.map((f) => ({
        id: f.id,
        event: f.properties.event,
        headline: f.properties.headline ?? null,
        instruction: f.properties.instruction ?? null,
        severity: f.properties.severity ?? null,
        expires: f.properties.expires ?? null,
        tier: tierOf(f.properties.event, f.properties.severity ?? null),
      })),
    );
  } catch {
    return null;
  }
}

/** Re-run `cb` when alerts may have changed. Realtime with Supabase, polling without. */
export function onAlertsChange(cb: () => void): () => void {
  if (supabase) {
    const ch = supabase
      .channel("alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, cb)
      .subscribe();
    return () => {
      supabase?.removeChannel(ch);
    };
  }
  const id = setInterval(cb, 5 * 60 * 1000);
  return () => clearInterval(id);
}
