import type { LngLat } from "./geo";
import { supabase } from "./supabase";

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

/** Highest-tier active alert at a point, or null. Empty when no backend. */
export async function alertAt(at: LngLat): Promise<Alert | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("alerts_at_point", {
    p_lat: at[1],
    p_lng: at[0],
    p_include_zone_alerts: false,
  });
  if (error || !data) return null;
  const alerts = (data as Array<Record<string, unknown>>).map(
    (r): Alert => ({
      id: r.id as string,
      event: r.event as string,
      headline: (r.headline as string) ?? null,
      instruction: (r.instruction as string) ?? null,
      severity: (r.severity as string) ?? null,
      expires: (r.expires as string) ?? null,
      tier: tierOf(r.event as string, (r.severity as string) ?? null),
    }),
  );
  alerts.sort((a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier]);
  return alerts[0] ?? null;
}

/** Re-run `cb` whenever the alerts table changes. Returns an unsubscribe. */
export function onAlertsChange(cb: () => void): () => void {
  if (!supabase) return () => {};
  const ch = supabase
    .channel("alerts")
    .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, cb)
    .subscribe();
  return () => {
    supabase?.removeChannel(ch);
  };
}
