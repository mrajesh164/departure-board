"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTrips } from "./providers";
import { Button, ButtonLink } from "@/components/Button";
import { Badge, Card, Label, SectionRule } from "@/components/Card";
import { PackProgress } from "@/components/PackProgress";
import { DestinationArt } from "@/components/DestinationArt";
import { STARTERS, createStarterTrip, starterDates } from "@/lib/starters";
import { conditionsFor, findClimate } from "@/lib/climate";
import { monthsSpanned } from "@/lib/suggestions";
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
 * The board. Two faces: the first visit, and coming back.
 *
 * Which one shows is decided twice — by the inline script in <head> via the
 * data-when CSS gate before paint, and by React once storage has been read. The
 * `data-when` attributes are what stop a returning person seeing the first-visit
 * screen flicker past; see globals.css.
 */

export default function BoardPage() {
  const { trips, ready } = useTrips();

  if (!ready) {
    // A quiet placeholder rather than the empty state — showing "nothing saved"
    // to someone with six trips, even for one frame, would be a lie.
    return <div aria-hidden="true" className="h-64" />;
  }

  return trips.length === 0 ? <FirstVisit /> : <TheBoard trips={trips} />;
}

/* ------------------------------------------------------------------ */
/* Flow 1 — the first visit                                            */
/* ------------------------------------------------------------------ */

function FirstVisit() {
  const { addTrip } = useTrips();
  const router = useRouter();

  function adopt(key: string) {
    const starter = STARTERS.find((s) => s.key === key);
    if (!starter) return;
    const trip = createStarterTrip(starter);
    addTrip(trip);
    // Straight to the built list — the useful thing, not a confirmation screen.
    router.push(`/trips/${trip.id}`);
  }

  return (
    <div data-when="first-visit">
      <h1 className="font-display text-display text-ink">
        What are you
        <br />
        packing for?
      </h1>

      <p className="measure mt-5 text-body text-muted">
        Keep the trips you take again on one board. Each one builds its own
        packing list from your dates, the weather there that month, and whatever
        you worked out last time.
      </p>

      <Label className="mt-9">Start with one of these</Label>
      <p className="mt-1 text-small text-muted">
        You can change the dates, the destination, and every item afterwards.
      </p>

      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {STARTERS.map((starter) => {
          const { startDate, endDate } = starterDates(starter);
          const climate = findClimate(starter.climateSlug);
          const conditions = climate
            ? conditionsFor(climate, monthsSpanned(startDate, endDate))
            : undefined;

          return (
            <li
              key={starter.key}
              className="flex flex-col border border-rule bg-surface"
            >
              {conditions && (
                <DestinationArt
                  seed={starter.destination}
                  slug={starter.climateSlug}
                  city={starter.destination}
                  conditions={conditions}
                  height={96}
                  className="border-0 border-b border-rule-strong"
                />
              )}

              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-display text-subhead text-ink">
                  {starter.name}
                </h2>
                <p className="mt-1 flex-1 text-small text-muted">
                  {starter.blurb}
                </p>
                <p className="mt-3 font-sans text-label uppercase text-muted">
                  {formatDateRange(startDate, endDate)} · {starter.destination}
                </p>
                <Button
                  variant="primary"
                  className="mt-3 w-full"
                  onClick={() => adopt(starter.key)}
                >
                  Build this list
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-7 text-body">
        <Link href="/trips/new" className="text-ink">
          Or plan a specific trip
        </Link>
      </p>
    </div>
  );
}

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
    <div data-when="returning">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-heading text-ink">Departures</h1>
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

      {departures.length === 0 && (
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
            Review {needsReview.name.toLowerCase()}
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
