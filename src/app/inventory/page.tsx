"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTrips } from "@/app/providers";
import { Badge, Label, SectionRule } from "@/components/Card";
import { AddKitForm } from "@/components/AddKitForm";
import { QuietAction, SegmentedControl } from "@/components/Controls";
import { styleFor } from "@/components/categoryStyle";
import { categoriesPresent, type ItemCategory } from "@/lib/types";
import { buildInventory, type KitEntry } from "@/lib/inventory";
import { formatDateRange, phaseOf, sortForBoard } from "@/lib/trips";

/**
 * Everything you own and everything the board has learned about it.
 *
 * Two views rather than three named buckets: the sorting *is* the insight.
 * "Packed most" is the kit you actually rely on; "packed least" is the stuff
 * riding along in the bottom of the bag. The counts speak for themselves, so
 * they don't need a headline telling you what to think about them.
 */

type View = "most" | "least";

export default function InventoryPage() {
  const { trips, kit, ready, addKitItems, removeKitItem } = useTrips();
  const [view, setView] = useState<View>("most");

  /* Guarded on `ready` because these reach phaseOf -> todayISO -> new Date(),
     and Cache Components refuses to bake a prerender-time clock reading into
     static HTML. `ready` is false during prerender, so nothing calls Date. */
  const entries = useMemo(
    () => (ready ? buildInventory(trips, kit) : []),
    [ready, trips, kit],
  );

  const ordered = useMemo(() => {
    const sorted = [...entries];
    return view === "most"
      ? sorted
      : sorted.reverse();
  }, [entries, view]);

  const categories = useMemo(
    () => categoriesPresent(ordered.map((e) => e.category)),
    [ordered],
  );

  const pastTrips = useMemo(
    () =>
      ready ? sortForBoard(trips).filter((t) => phaseOf(t) === "past") : [],
    [ready, trips],
  );

  if (!ready) return <div aria-hidden="true" className="h-64" />;

  return (
    <>
      <h1 className="font-display text-heading text-ink">Your Inventory</h1>

      <AddKitForm
        existingLabels={entries.map((e) => e.label)}
        existingCategories={categories}
        onAdd={addKitItems}
      />

      {entries.length === 0 ? (
        <p className="measure mt-8 text-body text-muted">
          Nothing here yet. Add what you own above, or pack a trip and the
          things you carry will show up on their own.
        </p>
      ) : (
        <>
          <SectionRule className="mt-10" />

          <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-heading text-ink">Everything</h2>
            <SegmentedControl
              value={view}
              onChange={setView}
              label="Sort the inventory"
              options={[
                ["most", "Packed most"],
                ["least", "Packed least"],
              ] as const}
            />
          </div>

          <div className="mt-5">
            {categories.map((category) => (
              <KitCategory
                key={category}
                category={category}
                entries={ordered.filter((e) => e.category === category)}
                onRemove={removeKitItem}
              />
            ))}
          </div>
        </>
      )}

      {pastTrips.length > 0 && (
        <>
          <SectionRule className="mt-10" />
          <h2 className="mt-4 font-display text-heading text-ink">
            What you took
          </h2>
          <p className="mt-1 text-small text-muted">
            Trips you&apos;ve finished, and what actually went in the bag.
          </p>

          <div className="mt-5">
            {pastTrips.map((trip) => {
              const packed = trip.items.filter((i) => i.packed);
              return (
                <section key={trip.id} className="mb-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-rule-strong pb-1">
                    <h3 className="font-display text-subhead text-ink">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="text-ink no-underline hover:text-accent"
                      >
                        {trip.name}
                      </Link>
                    </h3>
                    <Label>
                      {trip.destination} ·{" "}
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </Label>
                  </div>

                  {packed.length > 0 ? (
                    <p className="measure mt-2 text-small text-ink">
                      {packed.map((i) => i.label).join(", ")}
                    </p>
                  ) : (
                    <p className="mt-2 text-small text-muted">
                      Nothing was ticked off on this one.
                    </p>
                  )}

                  <p className="mt-1.5 text-small text-muted">
                    {packed.length} of {trip.items.length} packed
                    {trip.review
                      ? ` · reviewed, ${trip.learned.drop.length} retired`
                      : ""}
                  </p>
                </section>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

function KitCategory({
  category,
  entries,
  onRemove,
}: {
  category: ItemCategory;
  entries: KitEntry[];
  onRemove: (id: string) => void;
}) {
  if (entries.length === 0) return null;
  const style = styleFor(category);

  return (
    <section className="mb-6">
      <div
        className="flex items-baseline justify-between px-2.5 py-1.5"
        style={{
          backgroundColor: style.tint,
          borderBottom: `2px solid ${style.hue}`,
        }}
      >
        <h3
          className="flex items-center gap-2 font-sans text-label uppercase"
          style={{ color: style.hue }}
        >
          <span
            aria-hidden="true"
            className="inline-block size-2.5"
            style={{ backgroundColor: style.hue }}
          />
          {category}
        </h3>
        <span className="font-sans text-label uppercase text-muted">
          {entries.length}
        </span>
      </div>

      <ul className="px-2.5">
        {entries.map((entry) => (
          <li
            key={entry.label}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-b border-rule py-2 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_150px_220px_72px]"
          >
            <span
              className={`text-body ${
                entry.dropped
                  ? "text-muted line-through decoration-rule-strong"
                  : "text-ink"
              }`}
            >
              {entry.label}
            </span>

            <span className="hidden text-small text-muted sm:block">
              {entry.onTrips === 0
                ? "Not packed yet"
                : entry.packedTimes === 0
                  ? `Never packed, on ${entry.onTrips} ${entry.onTrips === 1 ? "list" : "lists"}`
                  : `Packed on ${entry.packedTimes} of ${entry.onTrips} ${entry.onTrips === 1 ? "trip" : "trips"}`}
            </span>

            <span className="flex flex-wrap items-center gap-2 sm:justify-start">
              {entry.owned && <Badge tone="accent">Yours</Badge>}
              {entry.requested && <Badge tone="success">Asked for</Badge>}
              {entry.dropped && <Badge>Retired</Badge>}
              {!entry.dropped &&
                entry.unpackedOnFinished > 0 &&
                entry.packedTimes === 0 && (
                  <Badge tone="warning">Never used</Badge>
                )}
            </span>

            <span className="hidden justify-self-end sm:block">
              {entry.kitId && (
                <QuietAction
                  onClick={() => onRemove(entry.kitId!)}
                  label={`Remove ${entry.label.toLowerCase()} from your inventory`}
                >
                  Remove
                </QuietAction>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
