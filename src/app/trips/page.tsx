"use client";

import Link from "next/link";
import { useTrips } from "@/app/providers";
import { ButtonLink } from "@/components/Button";
import { Badge, Card, Label, SectionRule } from "@/components/Card";
import { PackProgress } from "@/components/PackProgress";
import { DestinationArt } from "@/components/DestinationArt";
import { StarterTrips } from "@/components/StarterTrips";
import {
  awaitingReview,
  conditionsOf,
  countdownLabel,
  formatDateRange,
  lengthOf,
  packedCount,
  phaseOf,
  sortForBoard,
} from "@/lib/trips";
import type { Trip } from "@/lib/types";

/**
 * The board.
 *
 * Note it deliberately carries NO `data-when` attribute. The CSS gate in
 * globals.css hides `[data-when="returning"]` whenever storage is empty, which
 * is right on home — two faces, only one should paint — but fatal here: this
 * page has a single face, so the gate blanked the entire tab for anyone with no
 * trips saved. The empty state below is what should show instead.
 */

export default function BoardPage() {
  const { trips, ready } = useTrips();

  if (!ready) {
    // A quiet placeholder rather than the empty state — showing "nothing saved"
    // to someone with six trips, even for one frame, would be a lie.
    return <div aria-hidden="true" className="h-64" />;
  }

  return <TheBoard trips={trips} />;
}

/* ------------------------------------------------------------------ */
/* Flow 1 — the first visit                                            */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Flows 2 and 3 — the board                                           */
/* ------------------------------------------------------------------ */

function TheBoard({ trips }: { trips: Trip[] }) {
  const sorted = sortForBoard(trips);
  const departures = sorted.filter((t) => phaseOf(t) !== "past");
  const previously = sorted.filter((t) => phaseOf(t) === "past");
  const needsReview = awaitingReview(trips);
  const lead = departures[0];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-heading text-ink">Upcoming Trips</h1>
        <ButtonLink href="/trips/new" variant="primary">
          Add a trip
        </ButtonLink>
      </div>

      {/* The lead: whatever needs attention soonest, with its progress. This is
          the pre-trip reason to come back. */}
      {lead && <LeadDeparture trip={lead} />}

      {departures.length > 1 && (
        <ul className="mt-3">
          {departures.slice(1).map((trip) => (
            <TripRow key={trip.id} trip={trip} />
          ))}
        </ul>
      )}

      {/* Never a dead end: with nothing saved at all, the board says so plainly
          and then offers the same ready-made trips the front door does. Leaving
          the heading sitting above empty space told a new person nothing. */}
      {trips.length === 0 && (
        <>
          <p className="measure mt-3 text-body text-ink">
            No upcoming trips yet.
          </p>
          <div className="mt-6 border-t-2 border-ink pt-6">
            <StarterTrips />
          </div>
        </>
      )}

      {trips.length > 0 && departures.length === 0 && (
        <p className="measure mt-4 text-body text-muted">
          Nothing coming up. Pack one of your previous trips again, or add a new
          one.
        </p>
      )}

      {/* The post-trip reason to come back. */}
      {needsReview && (
        <Card className="mt-6 border-l-2 border-l-warning">
          <Label>Back from {needsReview.destination}?</Label>
          <p className="measure mt-1 text-body text-ink">
            Two questions about how that trip went, and the next one packs
            itself better.
          </p>
          <ButtonLink href={`/trips/${needsReview.id}/review`} className="mt-3">
            Review this trip
          </ButtonLink>
        </Card>
      )}

      {previously.length > 0 && (
        <>
          <SectionRule className="mt-10" />
          <h2 className="mt-4 font-display text-heading text-ink">
            Previously
          </h2>
          <ul className="mt-2">
            {previously.map((trip) => (
              <TripRow key={trip.id} trip={trip} past />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function LeadDeparture({ trip }: { trip: Trip }) {
  const { packed, total } = packedCount(trip.items);
  const left = total - packed;
  const conditions = conditionsOf(trip);

  return (
    <div className="mt-4 border border-rule bg-surface shadow-raised">
      {conditions && (
        <DestinationArt
          seed={trip.destination}
          slug={trip.climateSlug}
          city={trip.destination}
          conditions={conditions}
          height={132}
          className="border-0 border-b border-rule-strong"
        />
      )}

      <div className="p-5">
        <div className="flex items-baseline justify-between gap-4">
          <Label>{countdownLabel(trip)}</Label>
          {total > 0 && (
            <Label>{left === 0 ? "Packed" : `${left} left to pack`}</Label>
          )}
        </div>

        <h2 className="mt-1 font-display text-heading text-ink">
          <Link
            href={`/trips/${trip.id}`}
            className="text-ink no-underline hover:text-accent"
          >
            {trip.name}
          </Link>
        </h2>

        <p className="mt-0.5 text-small text-muted">
          {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)} ·{" "}
          {lengthOf(trip)} days
        </p>

        {total > 0 && (
          <PackProgress packed={packed} total={total} className="mt-4" />
        )}

        <ButtonLink
          href={`/trips/${trip.id}`}
          variant={left === 0 ? "secondary" : "primary"}
          className="mt-4"
        >
          {packed === 0
            ? "Start packing"
            : left === 0
              ? "Everything's packed"
              : "Carry on packing"}
        </ButtonLink>
      </div>
    </div>
  );
}

function TripRow({ trip, past = false }: { trip: Trip; past?: boolean }) {
  const { packed, total } = packedCount(trip.items);
  const conditions = conditionsOf(trip);

  return (
    <li className="flex items-center gap-4 border-b border-rule py-3 last:border-b-0">
      {conditions && (
        <DestinationArt
          seed={trip.destination}
          slug={trip.climateSlug}
          city={trip.destination}
          conditions={conditions}
          height={52}
          className="hidden w-20 shrink-0 sm:block"
        />
      )}

      <div className="min-w-0 flex-1">
        <Link
          href={`/trips/${trip.id}`}
          className="font-display text-subhead text-ink no-underline hover:text-accent"
        >
          {trip.name}
        </Link>
        <p className="text-small text-muted">
          {trip.destination} · {formatDateRange(trip.startDate, trip.endDate)}
        </p>
      </div>

      <span className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
        {!past && total > 0 && packed < total && (
          <span className="text-small text-muted">{total - packed} left</span>
        )}
        {trip.isExample && <Badge tone="warning">Example</Badge>}
        {!past && total > 0 && packed === total && (
          <Badge tone="success">Packed</Badge>
        )}
        <span className="font-sans text-label uppercase text-muted">
          {countdownLabel(trip)}
        </span>
        {/* A real button on every past row, not a link tucked in a menu.
            Researching comparable tools made this the deliberate choice:
            TripIt keeps years of trips and offers no way to act on one, and
            Todoist's templates are a one-shot copy that never learns. Reusing
            a corrected list is the thing this tool does that they don't, so it
            gets the weight of a primary action. */}
        {past && (
          <ButtonLink href={`/trips/new?from=${trip.id}`} variant="primary">
            Pack this again
          </ButtonLink>
        )}
      </span>
    </li>
  );
}
