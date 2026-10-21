"use client";

import { motion } from "motion/react";
import { TYPE_LABEL, type Shelter } from "@/lib/shelters";
import PrimaryButton from "./PrimaryButton";

type Props = { shelter: Shelter; onDone: () => void };

/** The payoff: a check that draws itself, then the place you are standing at. */
export default function ArrivalCard({ shelter, onDone }: Props) {
  const hours = shelter.hours?.is_24_7 ? "Open 24 hours" : shelter.hours?.raw ?? null;
  return (
    <div aria-live="assertive">
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", visualDuration: 0.45, bounce: 0.25 }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-safe/15 shadow-[0_0_30px_rgba(48,197,115,0.35)]"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#30c573" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <motion.path
              d="M5 12.5 10 17.5 19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.15, ease: [0.2, 0, 0, 1] }}
            />
          </svg>
        </motion.div>
        <div>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.25 }}
            className="text-[13px] font-semibold uppercase tracking-[0.08em] text-safe"
          >
            You&apos;ve arrived
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.25 }}
            className="text-[26px] font-semibold leading-[1.1] tracking-[-0.02em]"
          >
            {shelter.name}
          </motion.h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.25 }}
        className="mt-4 space-y-0.5 text-[16px] text-text-2"
      >
        <p>
          {TYPE_LABEL[shelter.type]}
          {hours ? <span className="text-text-3"> · {hours}</span> : null}
        </p>
        {shelter.address && <p className="text-text-3">{shelter.address}</p>}
        {shelter.phone && (
          <p>
            <a href={`tel:${shelter.phone}`} className="text-route underline-offset-4 hover:underline">
              Call {shelter.phone}
            </a>
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.25 }}
        className="mt-5"
      >
        <PrimaryButton label="Done" onClick={onDone} />
      </motion.div>
    </div>
  );
}
