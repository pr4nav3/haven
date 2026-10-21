"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, type PanInfo } from "motion/react";

export type Detent = "peek" | "half" | "full";

type Props = {
  detent: Detent;
  onDetentChange: (d: Detent) => void;
  peekHeight: number; // px, content height of the peek state
  children: ReactNode;
  glass?: boolean;
};

const FRACTIONS: Record<Exclude<Detent, "peek">, number> = { half: 0.5, full: 0.92 };
const EASE_SHEET = [0.32, 0.72, 0, 1] as const;

/**
 * Bottom sheet with three detents. The sheet is always 92vh tall and is
 * translated so only the detent's height shows; the map stays visible above.
 */
export default function Sheet({ detent, onDetentChange, peekHeight, children, glass = false }: Props) {
  const reduce = useReducedMotion();
  const [vh, setVh] = useState(0);
  const dragging = useRef(false);

  useEffect(() => {
    const update = () => setVh(window.visualViewport?.height ?? window.innerHeight);
    update();
    window.visualViewport?.addEventListener("resize", update);
    window.addEventListener("resize", update);
    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const fullH = vh * FRACTIONS.full;
  const visible = (d: Detent) => (d === "peek" ? peekHeight : vh * FRACTIONS[d]);
  const yFor = (d: Detent) => fullH - visible(d);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    dragging.current = false;
    const currentY = yFor(detent) + info.offset.y;
    const v = info.velocity.y;
    const order: Detent[] = ["peek", "half", "full"];
    let next = detent;
    if (Math.abs(v) > 400) {
      const i = order.indexOf(detent);
      next = v > 0 ? order[Math.max(0, i - 1)] : order[Math.min(2, i + 1)];
    } else {
      let best = Infinity;
      for (const d of order) {
        const dist = Math.abs(yFor(d) - currentY);
        if (dist < best) { best = dist; next = d; }
      }
    }
    onDetentChange(next);
  };

  if (!vh) return null;

  return (
    <motion.div
      role="dialog"
      aria-label="Shelter details"
      className={`surface ${glass ? "surface-glass" : ""} absolute inset-x-0 bottom-0 z-20 rounded-t-[16px] shadow-[0_-8px_40px_rgba(0,0,0,0.5)] sm:left-4 sm:right-auto sm:w-[420px] sm:rounded-t-[20px]`}
      style={{ height: fullH, touchAction: "pan-y", overscrollBehavior: "contain" }}
      initial={false}
      animate={{ y: yFor(detent) }}
      transition={reduce ? { duration: 0.2 } : { duration: 0.5, ease: EASE_SHEET }}
      drag="y"
      dragConstraints={{ top: yFor("full"), bottom: yFor("peek") }}
      dragElastic={{ top: 0.05, bottom: 0.2 }}
      dragMomentum={false}
      onDragStart={() => { dragging.current = true; }}
      onDragEnd={onDragEnd}
    >
      <div className="flex justify-center pt-3 pb-1" aria-hidden>
        <div className="h-1.5 w-10 rounded-full bg-white/25" />
      </div>
      <div
        className="h-[calc(100%-20px)] overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]"
        style={{ overscrollBehavior: "contain" }}
      >
        {children}
      </div>
    </motion.div>
  );
}
