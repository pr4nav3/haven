"use client";

import { motion } from "motion/react";
import { formatMiles } from "@/lib/geo";
import AnimatedNumber from "./AnimatedNumber";

type Props = {
  shelterName: string;
  remainingM: number;
  totalM: number;
  etaS: number;
  mode: "walk" | "drive";
};

/** Top card during guidance: how far is left, how long, and a progress line. */
export default function NavigationHud({ shelterName, remainingM, totalM, etaS, mode }: Props) {
  const progress = totalM > 0 ? Math.min(1, Math.max(0, 1 - remainingM / totalM)) : 0;
  const etaMin = Math.max(1, Math.round(etaS / 60));

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.2, 0, 0, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: [0.3, 0, 1, 1] } }}
      className="surface pointer-events-auto overflow-hidden rounded-[16px]"
    >
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-route/15 text-route">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 3 5 20l7-3 7 3z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <span className="text-[26px] font-semibold tracking-[-0.02em]">
              <AnimatedNumber value={remainingM / 1609.344} format={formatMiles} duration={0.4} />
            </span>
            <span className="text-[17px] font-medium text-text-2">
              <AnimatedNumber value={etaMin} format={(v) => `${Math.round(v)} min`} duration={0.4} />
              <span className="ml-1 text-[13px] text-text-3">{mode}</span>
            </span>
          </div>
          <p className="truncate text-[14px] text-text-3">to {shelterName}</p>
        </div>
      </div>
      <div className="h-[3px] w-full bg-white/8">
        <motion.div
          className="h-full bg-route shadow-[0_0_10px_rgba(86,168,251,0.8)]"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
