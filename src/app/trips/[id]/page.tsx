"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrips } from "@/app/providers";
import { Button, ButtonLink } from "@/components/Button";
import { Badge, Card, Label } from "@/components/Card";
import { CategorySection } from "@/components/CategorySection";
import { AddItemForm } from "@/components/AddItemForm";
import { Checkbox } from "@/components/Field";
import { PackCount, PackProgress } from "@/components/PackProgress";
import { MONTHS } from "@/lib/climate";
import { ConditionsNote } from "@/components/ConditionsNote";
import { EditDates } from "@/components/EditDates";
import { DestinationArt } from "@/components/DestinationArt";
import { monthsSpanned } from "@/lib/suggestions";
import {
  conditionsOf,
  countdownLabel,
  formatDateRange,
  lengthOf,
  packedCount,
  phaseOf,
} from "@/lib/trips";
import { categoriesPresent } from "@/lib/types";
import { buildInventory } from "@/lib/inventory";

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
  const {
    trips,
    kit,
    ready,
    toggleItem,
    setItemQty,
    addItem,
    removeItem,
    removeTrip,
    updateTrip,
  } = useTrips();

  const trip = trips.find((t) => t.id === id);

  /* "Hide what's packed" survives a reload, so reopening mid-pack lands you back
     in the same view rather than at the top of a list you'd already narrowed. */
  const filterKey = `departure-board.filter.${id}`;
  const [hidePacked, setHidePacked] = useState(false);
  /* Same constraint as the provider: this value only exists on the client, so
     it can't be a lazy initializer without desynchronising from the server
     render. Reading it in an effect is the correct trade here. */
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <ButtonLink href="/trips" className="mt-5">
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

  const month = MONTHS[monthsSpanned(trip.startDate, trip.endDate)[0]];

  /* Everything in the inventory that isn't already on this list, so the picker
     only ever offers something useful. */
  const onThisList = new Set(trip.items.map((i) => i.label.toLowerCase()));
  const inventoryOptions = buildInventory(trips, kit)
    .filter((e) => !e.dropped && !onThisList.has(e.label.toLowerCase()))
    .map((e) => ({ label: e.label, category: e.category }));

  const visible = hidePacked ? trip.items.filter((i) => !i.packed) : trip.items;

  function finish() {
    updateTrip(trip!.id, (t) => ({ ...t, completedAt: new Date().toISOString() }));
    router.push(`/trips/${trip!.id}/review`);
  }

  return (
    <>
      {/* --- header --- */}
      {conditions && (
        <DestinationArt
          seed={trip.destination}
          slug={trip.climateSlug}
          city={trip.destination}
          conditions={conditions}
          height={150}
          className="mb-5"
        />
      )}

      {/* An opened example says so, permanently, so it can never be mistaken
          for a trip the person created. */}
      {trip.isOnboarding && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-l-2 border-warning bg-surface px-4 py-3">
          <p className="measure text-small text-ink">
            <strong>This is the example.</strong> It&apos;s been packed twice, so
            the list already reflects what those trips taught it. Try
            &ldquo;Pack this again&rdquo; from the board — or delete it below.
          </p>
          <Badge tone="warning">Example</Badge>
        </div>
      )}

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Label>{countdownLabel(trip)}</Label>
        <Label>
          {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)} ·{" "}
          {days} days
        </Label>
      </div>

      <h1 className="mt-1 font-display text-heading text-ink">{trip.name}</h1>

      {conditions && (
        <ConditionsNote
          conditions={conditions}
          month={month}
          destination={trip.destination}
          source={trip.climateSlug ? "climate" : "manual"}
        />
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
        {categoriesPresent(trip.items.map((i) => i.category)).map((category) => (
          <CategorySection
            key={category}
            category={category}
            items={visible.filter((i) => i.category === category)}
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
          existingCategories={categoriesPresent(
            trip.items.map((i) => i.category),
          )}
          inventoryOptions={inventoryOptions}
          onAdd={(item) => addItem(trip.id, item)}
        />
      </div>

      {/* --- housekeeping ---
          One row of matching secondary buttons rather than a line of underlined
          links at different weights, which read as unrelated bits of text. The
          destructive action sits apart, on the right. */}
      <div className="mt-10 border-t border-rule pt-4">
        <div className="flex flex-wrap items-start gap-3">
          <ButtonLink href="/trips" variant="secondary">
            Back to the board
          </ButtonLink>

          {phase !== "past" && <EditDates trip={trip} />}

          {phase !== "past" && !allPacked && (
            <Button variant="secondary" onClick={finish}>
              Mark this trip finished
            </Button>
          )}

          <span className="ml-auto">
            {confirmingDelete ? (
              <span className="flex flex-wrap items-center gap-3">
                <span className="text-small text-ink">Delete this trip?</span>
                <Button
                  ref={confirmRef}
                  variant="danger"
                  onClick={() => {
                    removeTrip(trip.id);
                    router.push("/trips");
                  }}
                >
                  Delete
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setConfirmingDelete(false)}
                >
                  Keep it
                </Button>
              </span>
            ) : (
              <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                Delete trip
              </Button>
            )}
          </span>
        </div>
      </div>
    </>
  );
}
