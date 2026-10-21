"use client";

import { motion, stagger } from "motion/react";
import { TYPE_LABEL, type Shelter } from "@/lib/shelters";
import { compassLabel, formatMiles, formatMinutes } from "@/lib/geo";
import { mapsLink } from "@/lib/routing";
import type { Route } from "@/lib/routing";

type Props = {
  shelter: Shelter;
  route: Route | null;
  bearing: number;
  offline: boolean;
  onChange: () => void;
};

const row = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.2, 0, 0, 1] as const } },
};

export default function ShelterCard({ shelter, route, bearing, offline, onChange }: Props) {
  const miles = route ? route.distanceM / 1609.344 : shelter.distanceMi;
  const minutes = route ? formatMinutes(route.durationS) : null;
  const mode = route?.profile === "foot" ? "walk" : route ? "drive" : null;
  const hours = shelter.hours?.is_24_7 ? "Open 24 hours" : shelter.hours?.raw ?? null;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      transition={{ delayChildren: stagger(0.05) }}
      aria-live="polite"
    >
      <motion.p variants={row} className="text-[14px] font-medium uppercase tracking-wide text-safe">
        {offline ? "Offline · direction only" : "Nearest safe place"}
      </motion.p>

      <motion.h1 variants={row} className="mt-1 text-[28px] font-semibold leading-tight">
        {shelter.name}
      </motion.h1>

      <motion.div variants={row} className="tnum mt-3 flex items-baseline gap-4 text-[24px] font-semibold">
        <span>{formatMiles(miles)}</span>
        {minutes ? (
          <span className="text-text-2">
            {minutes} <span className="text-[16px] font-medium">{mode}</span>
          </span>
        ) : (
          <span className="text-text-2">
            {compassLabel(bearing)} <span className="text-[16px] font-medium">heading</span>
          </span>
        )}
      </motion.div>

      <motion.p variants={row} className="mt-3 text-[18px] text-text-2">
        {TYPE_LABEL[shelter.type]}
        {hours ? ` · ${hours}` : ""}
      </motion.p>
      {shelter.address && (
        <motion.p variants={row} className="mt-1 text-[18px] text-text-2">
          {shelter.address}
        </motion.p>
      )}

      <motion.div variants={row} className="mt-5 flex gap-3">
        <a
          href={mapsLink([shelter.lng, shelter.lat], shelter.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="pressable flex h-12 flex-1 items-center justify-center rounded-[12px] bg-route text-[17px] font-semibold text-[#0c0c0c]"
        >
          Navigate
        </a>
        {shelter.phone && (
          <a
            href={`tel:${shelter.phone}`}
            className="pressable flex h-12 w-12 items-center justify-center rounded-[12px] border border-white/15 bg-white/5"
            aria-label={`Call ${shelter.name}`}
          >
            <PhoneIcon />
          </a>
        )}
        <button
          type="button"
          onClick={onChange}
          className="pressable h-12 rounded-[12px] border border-white/15 bg-white/5 px-4 text-[16px] font-medium text-text"
        >
          Change
        </button>
      </motion.div>
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
