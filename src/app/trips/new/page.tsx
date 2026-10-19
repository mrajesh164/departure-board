"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TripForm } from "@/components/TripForm";
import { useTrips } from "@/app/providers";

/**
 * Add a trip — or repeat one. `?from=<id>` prefills from a finished trip and
 * carries its corrections forward, which is the whole "trips you repeat" idea:
 * the second time you pack something, you shouldn't start from scratch.
 *
 * useSearchParams needs a Suspense boundary so the route can still be
 * prerendered as a static shell under cacheComponents.
 */

export default function NewTripPage() {
  return (
    <Suspense fallback={<Heading repeating={false} />}>
      <NewTrip />
    </Suspense>
  );
}

function NewTrip() {
  const params = useSearchParams();
  const { trips, ready } = useTrips();

  const from = params.get("from");
  const repeatOf = from ? trips.find((t) => t.id === from) : undefined;

  // Wait for storage before deciding there's nothing to repeat, or a reload on
  // /trips/new?from=… would quietly turn into a blank new trip.
  if (from && !ready) return <Heading repeating />;

  return (
    <>
      <Heading repeating={Boolean(repeatOf)} />
      <TripForm repeatOf={repeatOf} />
    </>
  );
}

function Heading({ repeating }: { repeating: boolean }) {
  return (
    <>
      <h1 className="font-display text-heading text-ink">
        {repeating ? "Pack it again" : "A new trip"}
      </h1>
      <p className="measure mb-8 mt-1 text-body text-muted">
        The dates and the destination are all we need — the list builds itself
        from there.
      </p>
    </>
  );
}
