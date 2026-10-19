"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useTrips } from "@/app/providers";

/**
 * Put the app back to a true first visit.
 *
 * This is here for a specific reason: everything lives in localStorage on one
 * device, so there is otherwise no way to see the onboarding again once
 * you've saved a single trip — not for the person who built it, and not for
 * anyone being shown it. Short of a private window, the first visit becomes
 * unreachable the moment it succeeds.
 *
 * Behind a confirm, because it genuinely deletes everything.
 */

export function ResetFirstVisit() {
  const { trips, kit, ready, resetEverything } = useTrips();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  // Nothing to reset, and no point advertising it on a true first visit.
  if (!ready || (trips.length === 0 && kit.length === 0)) return null;

  if (!confirming) {
    return (
      <p className="text-small text-muted">
        <Button variant="quiet" onClick={() => setConfirming(true)}>
          Reset to first visit
        </Button>
      </p>
    );
  }

  return (
    <div
      role="group"
      aria-label="Confirm reset"
      className="flex flex-wrap items-center gap-3"
    >
      <p className="measure text-small text-ink">
        This deletes {trips.length}{" "}
        {trips.length === 1 ? "trip" : "trips"}
        {kit.length > 0
          ? ` and ${kit.length} inventory ${kit.length === 1 ? "item" : "items"}`
          : ""}{" "}
        from this browser. It can&apos;t be undone.
      </p>
      <Button
        ref={confirmRef}
        variant="danger"
        onClick={() => {
          resetEverything();
          setConfirming(false);
          router.push("/");
        }}
      >
        Delete everything
      </Button>
      <Button variant="secondary" onClick={() => setConfirming(false)}>
        Keep it
      </Button>
    </div>
  );
}
