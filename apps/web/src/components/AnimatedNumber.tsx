"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

type Props = {
  value: number;
  format: (v: number) => string;
  duration?: number;
  className?: string;
};

/** Counts between values instead of swapping them. */
export default function AnimatedNumber({ value, format, duration = 0.7, className = "" }: Props) {
  const last = useRef(value);
  const [text, setText] = useState(() => format(value));

  useEffect(() => {
    const from = last.current;
    last.current = value;
    if (from === value) return;
    const controls = animate(from, value, {
      duration,
      ease: [0.2, 0, 0, 1],
      onUpdate: (v) => setText(format(v)),
    });
    return () => controls.stop();
  }, [value, duration, format]);

  return <span className={`tnum ${className}`}>{text}</span>;
}
