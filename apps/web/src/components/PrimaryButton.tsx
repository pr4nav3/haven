"use client";

import { useEffect, useState } from "react";

type Props = {
  label: string;
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

/**
 * 64 px, near-white on near-black (17.9:1). Keeps its label while busy and
 * only shows the spinner after 150 ms so quick responses never flash it.
 */
export default function PrimaryButton({ label, busy = false, disabled = false, onClick }: Props) {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!busy) return;
    const t = setTimeout(() => setShowSpinner(true), 150);
    return () => {
      clearTimeout(t);
      setShowSpinner(false);
    };
  }, [busy]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy}
      className="pressable relative flex h-16 w-full items-center justify-center rounded-[14px] bg-[#f5f5f5] px-6 text-[19px] font-semibold leading-none tracking-[-0.01em] text-[#0c0c0c] active:bg-[#e6e6e6] disabled:cursor-default"
    >
      <span className={showSpinner ? "opacity-70" : ""}>{label}</span>
      {showSpinner && (
        <span
          aria-hidden
          className="absolute right-5 h-5 w-5 animate-spin rounded-full border-2 border-[#0c0c0c]/25 border-t-[#0c0c0c]"
        />
      )}
    </button>
  );
}
