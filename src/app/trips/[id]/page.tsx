"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTrips } from "@/app/providers";
import { Button, ButtonLink } from "@/components/Button";
import { Card, Label } from "@/components/Card";
import { CategorySection } from "@/components/CategorySection";
import { AddItemForm } from "@/components/AddItemForm";
import { Checkbox } from "@/components/Field";
import { PackCount, PackProgress } from "@/components/PackProgress";
import { MONTHS, describeConditions } from "@/lib/climate";
import { monthsSpanned } from "@/lib/suggestions";
import {
  conditionsOf,
  countdownLabel,
  formatDateRange,
  lengthOf,
  packedCount,
  phaseOf,
} from "@/lib/trips";
import { CATEGORY_ORDER } from "@/lib/types";

/**
 * The checklist. The core task, and the screen this app exists for.
 *
 * Packing happens over several evenings rather than in one sitting, so this
 * page is built to be left and come back to: the filter persists, nothing is
 * ever cleared, and the board outside advertises what's left.
 */

export default function TripPage() {
  /* useParams suspends here: [id] isn't known at build time, so the route can't
     resolve it while prerendering. The boundary lets the static shell render. */
  return (
    <Suspense fallback={<div aria-hidden="true" className="h-64" />}>
      <Checklist />
    </Suspense>
  );
}

function Checklist() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { trips, ready, toggleItem, setItemQty, addItem, removeItem, removeTrip, updateTrip } =
    useTrips();

  const trip = trips.find((t) => t.id === id);

  /* "Hide what's packed" survives a reload, so reopening mid-pack lands you back
     in the same view rather than at the top of a list you'd already narrowed. */
  const filterKey = `departure-board.filter.${id}`;
  const [hidePacked, setHidePacked] = useState(false);
  useEffect(() => {
    try {
      setHidePacked(localStorage.getItem(filterKey) === "1");
    } catch {
      /* private browsing — the default is fine */
    }
  }, [filterKey]);

  function toggleFilter(next: boolean) {
    setHidePacked(next);
    try {
      localStorage.setItem(filterKey, next ? "1" : "0");
    } catch {
      /* nothing to do */
    }
  }

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (confirmingDelete) confirmRef.current?.focus();
  }, [confirmingDelete]);

  if (!ready) return <div aria-hidden="true" className="h-64" />;

  if (!trip) {
    return (
      <>
        <h1 className="font-display text-heading text-ink">
          That trip isn&apos;t here
        </h1>
        <p className="measure mt-2 text-body text-muted">
          It may have been removed, or saved in a different browser — everything
          lives on the device you created it on.
        </p>
        <ButtonLink href="/" className="mt-5">
          Back to the board
        </ButtonLink>
      </>
    );
  }

  const { packed, total } = packedCount(trip.items);
  const left = total - packed;
  const allPacked = total > 0 && left === 0;
  const conditions = conditionsOf(trip);
  const days = lengthOf(trip);
  const phase = phaseOf(trip);

  const context = {
    month: MONTHS[monthsSpanned(trip.startDate, trip.endDate)[0]],
    destination: trip.destination,
    days,
  };

  const visible = hidePacked ? trip.items.filter((i) => !i.packed) : trip.items;

  function finish() {
    updateTrip(trip!.id, (t) => ({ ...t, completedAt: new Date().toISOString() }));
    router.push(`/trips/${trip!.id}/review`);
  }

  return (
    <>
      {/* --- header --- */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Label>{countdownLabel(trip)}</Label>
        <Label>
          {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)} ·{" "}
          {days} days
        </Label>
      </div>

      <h1 className="mt-1 font-display text-heading text-ink">{trip.name}</h1>

      {conditions && (
        <p className="measure mt-1 text-small text-muted">
          Usually {describeConditions(conditions)} — that&apos;s what this list
          is built for.
        </p>
      )}

      {/* --- progress --- */}
      {total > 0 && (
        <div className="mt-6">
          <div className="mb-1.5 flex items-baseline justify-between">
            <Label>{allPacked ? "All packed" : `${left} still to pack`}</Label>
            <PackCount packed={packed} total={total} />
          </div>
          <PackProgress packed={packed} total={total} />
        </div>
      )}

      {/* Completion, announced politely rather than shouted. */}
      <p aria-live="polite" className="mt-4 text-body text-success">
        {allPacked ? "Packed. Have a good trip." : ""}
      </p>

      {allPacked && phase !== "past" && (
        <Card className="mt-2">
          <p className="measure text-body text-ink">
            When you&apos;re back, two quick questions will make the next one
            better.
          </p>
          <Button variant="secondary" className="mt-3" onClick={finish}>
            I&apos;m back — review this trip
          </Button>
        </Card>
      )}

      {/* --- the filter --- */}
      {total > 0 && (
        <label className="mt-6 flex cursor-pointer items-center gap-2 text-small text-ink">
          <Checkbox
            checked={hidePacked}
            onChange={(e) => toggleFilter(e.target.checked)}
          />
          Hide what&apos;s packed
        </label>
      )}

      {/* --- the list --- */}
      <div className="mt-5">
        {CATEGORY_ORDER.map((category) => (
          <CategorySection
            key={category}
            category={category}
            items={visible.filter((i) => i.category === category)}
            context={context}
            onToggle={(itemId) => toggleItem(trip.id, itemId)}
            onQty={(itemId, qty) => setItemQty(trip.id, itemId, qty)}
            onRemove={(itemId) => removeItem(trip.id, itemId)}
          />
        ))}

        {hidePacked && visible.length === 0 && total > 0 && (
          <p className="text-body text-muted">
            Nothing left. Untick the filter to see the whole list again.
          </p>
        )}

        {total === 0 && (
          <p className="measure text-body text-muted">
            This list is empty. Add what you need below — it&apos;ll be
            remembered for next time.
          </p>
        )}
      </div>

      {/* --- add your own --- */}
      <div className="mt-8 border-t-2 border-ink pt-5">
        <AddItemForm
          existingLabels={trip.items.map((i) => i.label)}
          onAdd={(item) => addItem(trip.id, item)}
        />
      </div>

      {/* --- housekeeping --- */}
      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-rule pt-4">
        <Link href="/" className="text-small text-ink">
          Back to the board
        </Link>

        {phase !== "past" && !allPacked && (
          <Button variant="quiet" onClick={finish}>
            Mark this trip finished
          </Button>
        )}

        <span className="ml-auto">
          {confirmingDelete ? (
            <span className="flex items-center gap-3">
              <span className="text-small text-ink">Delete this trip?</span>
              <Button
                ref={confirmRef}
                variant="danger"
                onClick={() => {
                  removeTrip(trip.id);
                  router.push("/");
                }}
              >
                Delete
              </Button>
              <Button variant="quiet" onClick={() => setConfirmingDelete(false)}>
                Keep it
              </Button>
            </span>
          ) : (
            <Button variant="quiet" onClick={() => setConfirmingDelete(true)}>
              Delete trip
            </Button>
          )}
        </span>
      </div>
    </>
  );
}
