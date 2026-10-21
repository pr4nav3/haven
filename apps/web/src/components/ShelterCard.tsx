"use client";

import { motion, stagger } from "motion/react";
import { TYPE_LABEL, type Shelter } from "@/lib/shelters";
import { compassLabel, formatMiles } from "@/lib/geo";
import type { Route } from "@/lib/routing";
import AnimatedNumber from "./AnimatedNumber";
import PrimaryButton, { ArrowIcon } from "./PrimaryButton";

type Props = {
  shelter: Shelter;
  route: Route | null;
  bearing: number;
  offline: boolean;
  onStart: () => void;
  onChange: () => void;
};

const row = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.2, 0, 0, 1] as const } },
};

export default function ShelterCard({ shelter, route, bearing, offline, onStart, onChange }: Props) {
  const miles = route ? route.distanceM / 1609.344 : shelter.distanceMi;
  const minutes = route ? Math.max(1, Math.round(route.durationS / 60)) : null;
  const mode = route?.profile === "foot" ? "walk" : route ? "drive" : null;
  const hours = shelter.hours?.is_24_7 ? "Open 24 hours" : shelter.hours?.raw ?? null;

  return (
    <motion.div
      key={shelter.id}
      initial="hidden"
      animate="show"
      transition={{ delayChildren: stagger(0.05) }}
      aria-live="polite"
    >
      <motion.p variants={row} className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-safe">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-safe shadow-[0_0_8px_rgba(48,197,115,0.9)]" />
        {offline ? "Offline · direction only" : shelter.type === "fema" ? "Open emergency shelter" : "Nearest safe place"}
      </motion.p>

      <motion.h1 variants={row} className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-[-0.02em]">
        {shelter.name}
      </motion.h1>

      <motion.div variants={row} className="mt-3 flex items-baseline gap-4">
        <span className="text-[30px] font-semibold tracking-[-0.02em]">
          <AnimatedNumber value={miles} format={formatMiles} />
        </span>
        {minutes !== null ? (
          <span className="text-[22px] font-medium text-text-2">
            <AnimatedNumber value={minutes} format={(v) => `${Math.round(v)} min`} />
            <span className="ml-1.5 text-[15px] text-text-3">{mode}</span>
          </span>
        ) : (
          <span className="text-[22px] font-medium text-text-2">
            {compassLabel(bearing)} <span className="text-[15px] text-text-3">heading</span>
          </span>
        )}
      </motion.div>

      <motion.p variants={row} className="mt-3 text-[16px] text-text-2">
        {TYPE_LABEL[shelter.type]}
        {hours ? <span className="text-text-3"> · {hours}</span> : null}
      </motion.p>
      {shelter.address && (
        <motion.p variants={row} className="mt-0.5 text-[16px] text-text-3">
          {shelter.address}
        </motion.p>
      )}

      <motion.div variants={row} className="mt-5 flex gap-3">
        <div className="flex-1">
          <PrimaryButton label="Start" icon={<ArrowIcon />} variant="accent" size="md" onClick={onStart} />
        </div>
        {shelter.phone && (
          <a
            href={`tel:${shelter.phone}`}
            className="pressable btn-ghost flex h-12 w-12 items-center justify-center rounded-full"
            aria-label={`Call ${shelter.name}`}
          >
            <PhoneIcon />
          </a>
        )}
        <button
          type="button"
          onClick={onChange}
          className="pressable btn-ghost h-12 rounded-full px-5 text-[15px] font-medium"
        >
          Change
        </button>
      </motion.div>
      {route && (
        <motion.p variants={row} className="mt-3 text-[13px] text-text-3">
          Start follows you along the route in Haven. Route data © OpenStreetMap.
        </motion.p>
      )}
    </motion.div>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}
