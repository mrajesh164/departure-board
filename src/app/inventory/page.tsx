"use client";

import { useMemo } from "react";
import { useTrips } from "@/app/providers";
import { ButtonLink } from "@/components/Button";
import { Badge, Card, Label, SectionRule } from "@/components/Card";
import { CATEGORY_ORDER, type ItemCategory } from "@/lib/types";
import { buildInventory, summarise, type KitEntry } from "@/lib/inventory";
import { CATEGORY_STYLE } from "@/components/categoryStyle";

/**
 * Everything the board has learned about what you pack.
 *
 * The point of this page is to make the correction loop legible. Per-trip, you
 * only ever see one list; here you can see that the umbrella has been on six
 * trips and used twice, and decide something about it.
 */

export default function InventoryPage() {
  const { trips, ready } = useTrips();

  const entries = useMemo(() => buildInventory(trips), [trips]);
  const summary = useMemo(() => summarise(entries, trips), [entries, trips]);

  if (!ready) return <div aria-hidden="true" className="h-64" />;

  if (trips.length === 0) {
    return (
      <>
        <h1 className="font-display text-heading text-ink">Your kit</h1>
        <p className="measure mt-2 text-body text-muted">
          Once you&apos;ve packed a trip or two, this is where you&apos;ll see
          what you actually carry — what goes in the bag every time, what comes
          home untouched, and what you&apos;ve taught the board to stop
          suggesting.
        </p>
        <ButtonLink href="/" variant="primary" className="mt-5">
          Start your first trip
        </ButtonLink>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-heading text-ink">Your kit</h1>
      <p className="measure mt-1 text-body text-muted">
        {summary.distinctItems} distinct things across{" "}
        {summary.tripCount} {summary.tripCount === 1 ? "trip" : "trips"}.
      </p>

      {/* The three things actually worth acting on, before the full table. */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Highlight
          count={summary.earned.length}
          title="Earned their place"
          note="You added these yourself, and now they're suggested."
          entries={summary.earned}
          tone="success"
        />
        <Highlight
          count={summary.deadWeight.length}
          title="Came home untouched"
          note="Carried on a finished trip and never ticked off."
          entries={summary.deadWeight}
          tone="warning"
        />
        <Highlight
          count={summary.retired.length}
          title="Retired"
          note="You've told the board to stop suggesting these."
          entries={summary.retired}
          tone="neutral"
        />
      </div>

      <SectionRule className="mt-10" />
      <h2 className="mt-4 font-display text-heading text-ink">Everything</h2>
      <p className="mt-1 text-small text-muted">
        Ordered by how many trips it&apos;s been on.
      </p>

      <div className="mt-5">
        {CATEGORY_ORDER.map((category) => (
          <KitCategory
            key={category}
            category={category}
            entries={entries.filter((e) => e.category === category)}
          />
        ))}
      </div>
    </>
  );
}

function Highlight({
  count,
  title,
  note,
  entries,
  tone,
}: {
  count: number;
  title: string;
  note: string;
  entries: KitEntry[];
  tone: "success" | "warning" | "neutral";
}) {
  return (
    <Card className="flex flex-col">
      <p className="font-display text-display leading-none text-ink">{count}</p>
      <h3 className="mt-2 font-sans text-small font-semibold text-ink">
        {title}
      </h3>
      <p className="mt-0.5 flex-1 text-small text-muted">{note}</p>
      {entries.length > 0 && (
        <p className="mt-2 text-small text-ink">
          {entries
            .slice(0, 3)
            .map((e) => e.label.toLowerCase())
            .join(", ")}
          {entries.length > 3 ? `, and ${entries.length - 3} more` : ""}
        </p>
      )}
      <span className="mt-2">
        <Badge tone={tone}>
          {tone === "warning" ? "Worth a look" : tone === "success" ? "Learned" : "Dropped"}
        </Badge>
      </span>
    </Card>
  );
}

function KitCategory({
  category,
  entries,
}: {
  category: ItemCategory;
  entries: KitEntry[];
}) {
  if (entries.length === 0) return null;
  const style = CATEGORY_STYLE[category];

  return (
    <section className="mb-7">
      <div
        className="mb-1 flex items-baseline justify-between border-b border-rule-strong pb-1"
        style={{ borderBottomColor: style.hue }}
      >
        <h3 className="flex items-center gap-2 font-sans text-label uppercase text-ink">
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

      <ul>
        {entries.map((entry) => (
          <li
            key={entry.label}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-rule py-2 last:border-b-0"
          >
            <span
              className={`text-body ${entry.dropped ? "text-muted line-through decoration-rule-strong" : "text-ink"}`}
            >
              {entry.label}
            </span>

            <span className="text-small text-muted">
              on {entry.onTrips} {entry.onTrips === 1 ? "trip" : "trips"}
              {entry.packedTimes > 0 && ` · packed ${entry.packedTimes}×`}
            </span>

            <span className="ml-auto flex flex-wrap items-center gap-2">
              {entry.yourOwn && <Badge tone="accent">Yours</Badge>}
              {entry.requested && <Badge tone="success">Asked for</Badge>}
              {entry.dropped && <Badge>Retired</Badge>}
              {!entry.dropped && entry.unpackedOnFinished > 0 && entry.packedTimes === 0 && (
                <Badge tone="warning">Never used</Badge>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
