"use client";

import { AnimatePresence, motion } from "motion/react";

type Props = { status: string | null; tone?: "safe" | "muted" };

/** Small brand and a single status pill. Hidden when a banner or HUD owns the top. */
export default function Wordmark({ status, tone = "safe" }: Props) {
  return (
    <div className="pointer-events-none absolute left-4 top-[calc(env(safe-area-inset-top)+14px)] z-30 flex items-center gap-2.5">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.2, 0, 0, 1] }}
        className="pill flex h-9 items-center gap-2 rounded-full px-3.5"
      >
        <span className="h-2 w-2 rounded-full bg-route shadow-[0_0_10px_rgba(86,168,251,0.9)]" />
        <span className="text-[14px] font-semibold tracking-[-0.01em]">Haven</span>
      </motion.div>
      <AnimatePresence>
        {status && (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.5, ease: [0.2, 0, 0, 1] }}
            className="pill flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium text-text-2"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tone === "safe" ? "bg-safe" : "bg-advisory"}`} />
            {status}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
