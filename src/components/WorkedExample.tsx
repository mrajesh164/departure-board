"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { Badge, Label } from "./Card";
import { Checkbox } from "./Field";
import { DestinationArt } from "./DestinationArt";
import { useTrips } from "@/app/providers";
import {
  buildExampleTrip,
  dismissExample,
  exampleDismissed,
  exampleHighlights,
} from "@/lib/example";
import { conditionsOf, formatDateRange } from "@/lib/trips";

/**
 * "See how it works" — a trip that has already been packed twice.
 *
 * This is the part of the first visit that carries the actual idea. The three
 * starters prove the tool builds a list; this proves the list *learns*, which
 * is the only thing it does that a notes app doesn't, and the one thing a first
 * visit otherwise can't demonstrate.
 *
 * The corrected rows are shown inline, so the point lands without a click.
 */

export function WorkedExample() {
  const { addTrip } = useTrips();
  const router = useRouter();

  // Built once per mount: it contains a crypto.randomUUID, so regenerating it
  // on every render would hand a different trip to each click.
  const trip = useMemo(() => buildExampleTrip(), []);
  const [hidden, setHidden] = useState(() => exampleDismissed());

  if (hidden) return null;

  const highlights = exampleHighlights(trip);
  const conditions = conditionsOf(trip);

  function open() {
    addTrip(trip);
    router.push(`/trips/${trip.id}`);
  }

  function dismiss() {
    dismissExample();
    setHidden(true);
  }

  return (
    <section className="border border-rule bg-surface">
      {conditions && (
        <DestinationArt
          seed={trip.destination}
          slug={trip.climateSlug}
          city={trip.destination}
          conditions={conditions}
          height={96}
          className="border-0 border-b border-rule-strong"
        />
      )}

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>See how it works</Label>
          <Badge>Example</Badge>
        </div>

        <h3 className="mt-1 font-display text-subhead text-ink">{trip.name}</h3>
        <p className="mt-0.5 text-small text-muted">
          {trip.destination} ·{" "}
          {formatDateRange(trip.startDate, trip.endDate)} · packed twice before
        </p>

        <p className="measure mt-3 text-body text-ink">
          Two trips in, this list has already fixed itself:
        </p>

        {/* The corrections, visible without clicking through. */}
        <ul className="mt-3 border-t border-rule">
          {highlights.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 border-b border-rule py-2"
            >
              <Checkbox checked readOnly aria-label={`${item.label}, packed`} />
              <span className="flex-1 text-body text-ink">{item.label}</span>
              <span className="text-small text-success">
                you added this last time
              </span>
            </li>
          ))}
          {trip.learned.drop.map((label) => (
            <li
              key={label}
              className="flex items-center gap-3 border-b border-rule py-2 last:border-b-0"
            >
              <span
                aria-hidden="true"
                className="size-[18px] shrink-0 border border-rule-strong bg-surface-raised"
              />
              <span className="flex-1 text-body text-muted line-through decoration-rule-strong">
                {label}
              </span>
              <span className="text-small text-muted">
                you never used it, so it&apos;s gone
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={open}>
            Open the example
          </Button>
          <Button variant="quiet" onClick={dismiss}>
            No thanks
          </Button>
        </div>
      </div>
    </section>
  );
}
