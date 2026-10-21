"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Alert, Tier } from "@/lib/alerts";

const TIER: Record<Tier, { color: string; label: string; role: "status" | "alert" }> = {
  advisory: { color: "var(--advisory)", label: "Advisory", role: "status" },
  warning: { color: "var(--warning)", label: "Warning", role: "status" },
  take_action: { color: "var(--emergency)", label: "Take action", role: "alert" },
};

/**
 * One banner at a time, dark surface with the tier carried by a left edge,
 * icon, capsule and text. Never a solid colored flood (fails AA for white text).
 */
export default function SeverityBanner({ alert }: { alert: Alert | null }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
      <AnimatePresence mode="wait">
        {alert && (
          <motion.div
            key={alert.id}
            role={TIER[alert.tier].role}
            aria-live={alert.tier === "take_action" ? "assertive" : "polite"}
            initial={{ y: "-120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.2, 0, 0, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.2, ease: [0.3, 0, 1, 1] } }}
            className="surface pointer-events-auto flex min-h-12 items-start gap-3 rounded-[10px] py-3 pl-3 pr-4"
            style={{ borderLeft: `4px solid ${TIER[alert.tier].color}` }}
          >
            <WarningIcon color={TIER[alert.tier].color} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wide"
                  style={{ color: TIER[alert.tier].color, background: "rgba(255,255,255,0.06)" }}
                >
                  {TIER[alert.tier].label}
                </span>
                <span className="truncate text-[20px] font-semibold leading-tight" style={{ color: TIER[alert.tier].color }}>
                  {alert.event}
                </span>
              </div>
              {alert.tier !== "advisory" && alert.headline && (
                <p className="mt-1 line-clamp-2 text-[16px] leading-snug text-text-2">{alert.headline}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WarningIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
