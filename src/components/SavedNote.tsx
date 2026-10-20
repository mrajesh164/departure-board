"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A quiet "Saved" that appears for a moment after the list changes.
 *
 * This exists instead of a Save button. Every change already writes to
 * localStorage the instant it happens, so a Save button would have nothing to
 * do — and a control that does nothing is worse than none, because it teaches
 * people they must press it and then worries them when they forget.
 *
 * The real gap was that nothing *said* so. This does, at the moment it's true,
 * and then gets out of the way.
 *
 * It watches a value rather than an event so it fires for anything that changes
 * the trip — ticking, quantities, adding, removing — without every call site
 * having to remember to announce itself.
 */

export function SavedNote({ watch }: { watch: string | number }) {
  const [visible, setVisible] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    // Don't claim to have saved something just because the page opened.
    if (first.current) {
      first.current = false;
      return;
    }
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(t);
  }, [watch]);

  return (
    <span
      aria-live="polite"
      className={`font-sans text-label uppercase text-success transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {visible ? "Saved" : ""}
    </span>
  );
}
