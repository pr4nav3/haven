"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";

type Props = {
  label: string;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "primary" | "accent" | "ghost";
  size?: "lg" | "md";
};

/**
 * The one bright object on screen. Keeps its label while busy and only shows
 * the spinner after 150 ms so quick responses never flash it. Press feedback
 * is CSS; the release settles on a small spring.
 */
export default function PrimaryButton({
  label,
  busy = false,
  disabled = false,
  onClick,
  icon,
  variant = "primary",
  size = "lg",
}: Props) {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!busy) return;
    const t = setTimeout(() => setShowSpinner(true), 150);
    return () => {
      clearTimeout(t);
      setShowSpinner(false);
    };
  }, [busy]);

  const cls =
    variant === "primary" ? "btn-primary" : variant === "accent" ? "btn-accent" : "btn-ghost";
  const h = size === "lg" ? "h-[60px] text-[18px]" : "h-12 text-[16px]";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy}
      whileTap={disabled || busy ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", visualDuration: 0.25, bounce: 0.1 }}
      className={`${cls} relative flex ${h} w-full items-center justify-center gap-2.5 rounded-full px-6 font-semibold leading-none tracking-[-0.01em] disabled:cursor-default`}
      style={{ touchAction: "manipulation" }}
    >
      {icon && <span className={`shrink-0 ${showSpinner ? "opacity-0" : ""}`} aria-hidden>{icon}</span>}
      <span className={showSpinner ? "opacity-70" : ""}>{label}</span>
      {showSpinner && (
        <span
          aria-hidden
          className="absolute right-5 h-5 w-5 animate-spin rounded-full border-2 border-current/25 border-t-current"
        />
      )}
    </motion.button>
  );
}

export function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.5 20.5 21 12 17.2 3.5 21z" />
    </svg>
  );
}
