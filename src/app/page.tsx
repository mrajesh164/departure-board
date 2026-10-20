"use client";

import Link from "next/link";
import { useTrips } from "./providers";
import { ButtonLink } from "@/components/Button";
import { Label } from "@/components/Card";
import { StarterTrips } from "@/components/StarterTrips";
import { DESTINATION_PHOTOS } from "@/lib/photos";
import {
  countdownLabel,
  nextDeparture,
  packedCount,
  phaseOf,
} from "@/lib/trips";
import type { Trip } from "@/lib/types";

/**
 * The front door, with two faces.
 *
 * Someone arriving for the first time gets the onboarding here: what the tool
 * is, in one breath, and three ready-made trips where one tap produces a real
 * packing list. No account, no tour, nothing to fill in first.
 *
 * Someone coming back gets the live state instead — the next departure and
 * what's still unpacked — so home isn't a toll gate between them and the list
 * they came to finish.
 *
 * Which face shows is decided twice: by the inline script in <head> through the
 * data-when CSS gate before first paint, and by React once storage has been
 * read. That's what stops a returning person seeing the first-visit screen
 * flicker past. See globals.css and lib/storage.ts.
 */

const SECTIONS = [
  {
    href: "/trips",
    label: "Upcoming",
    title: "The trips you have",
    blurb:
      "Every trip on one board, soonest first, each showing what's still left to pack.",
    photo: DESTINATION_PHOTOS["lisbon"],
  },
  {
    href: "/trips/new",
    label: "New trip",
    title: "Start a new one",
    blurb:
      "Give it a name, a destination and dates. The packing list builds itself from there.",
    photo: DESTINATION_PHOTOS["tokyo"],
  },
  {
    href: "/inventory",
    label: "Inventory",
    title: "What you own",
    blurb:
      "Everything you carry, how often it actually gets packed, and what you've retired.",
    // A steamer trunk rather than another city: this card isn't about a place.
    // It also happens to be exactly the design system's "worn at the corners".
    photo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Trunk_1.jpg/1280px-Trunk_1.jpg",
  },
] as const;

export default function HomePage() {
  const { trips, ready } = useTrips();

  if (!ready) {
    // A quiet placeholder rather than the empty state — showing "nothing saved"
    // to someone with six trips, even for one frame, would be a lie.
    return <div aria-hidden="true" className="h-64" />;
  }

  return trips.length === 0 ? <FirstVisit /> : <Returning trips={trips} />;
}

/* ------------------------------------------------------------------ */
/* Flow 1 — the first visit                                            */
/* ------------------------------------------------------------------ */

function FirstVisit() {
  return (
    <div data-when="first-visit">
      {/* A greeting rather than a wordmark: the masthead already carries the
          name, and this is the one line that gets to speak to a person who has
          just arrived. */}
      <h1 className="font-display text-display text-ink">
        Welcome to
        <br />
        The Departure Board
      </h1>

      {/* One line, then straight into the thing itself.
          This used to be a proposition plus a three-line explanation plus a
          section label plus two lines of instructions — about sixty words
          standing between a new person and the first useful screen. The cards
          below already say what the tool does: a destination, a month, an item
          count and the weather it reasoned from. Reading that is learning by
          doing; reading a paragraph about it is not. */}
      <p className="measure mt-4 text-subhead font-semibold text-ink">
        Packing lists that build themselves.
      </p>

      <div className="mt-8">
        <StarterTrips heading={false} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flow 3 — coming back                                                */
/* ------------------------------------------------------------------ */

function Returning({ trips }: { trips: Trip[] }) {
  const { kit } = useTrips();
  const next = nextDeparture(trips);
  const unreviewed = trips.filter(
    (t) => phaseOf(t) === "past" && !t.review,
  ).length;

  /* Evidence that the tool actually remembers them. This is the whole reason to
     come back rather than start a list in Notes again, so it leads rather than
     hiding in the Inventory tab. */
  const finished = trips.filter((t) => phaseOf(t) === "past").length;
  const corrections = trips.reduce(
    (n, t) => n + t.learned.add.length + t.learned.drop.length,
    0,
  );

  return (
    <div data-when="returning">
      <section className="border-b-2 border-ink pb-8">
        <h1 className="font-display text-display text-ink">Welcome Back.</h1>

        <p className="measure mt-4 text-body text-ink">
          {summarise({ trips: trips.length, finished, kit: kit.length, corrections })}
        </p>

        {next ? (
          <NextUp trip={next} />
        ) : (
          <>
            <p className="measure mt-5 text-body text-muted">
              Nothing coming up. Pack one of your previous trips again, or plan
              something new.
            </p>
            <ButtonLink href="/trips/new" variant="primary" className="mt-5">
              Plan your next trip
            </ButtonLink>
          </>
        )}

        {unreviewed > 0 && (
          <p className="mt-3 text-small text-muted">
            {unreviewed === 1
              ? "One finished trip is waiting on a review."
              : `${unreviewed} finished trips are waiting on a review.`}
          </p>
        )}
      </section>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="group flex h-full flex-col border border-rule bg-surface no-underline transition-shadow hover:shadow-raised"
            >
              <div className="h-28 overflow-hidden border-b border-rule-strong">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section.photo}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-4">
                <Label>{section.label}</Label>
                <h2 className="mt-1 font-display text-subhead text-ink group-hover:text-accent">
                  {section.title}
                </h2>
                <p className="mt-1 flex-1 text-small text-muted">
                  {section.blurb}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One sentence of accumulated state, in plain English rather than a stat row.
 * It has to earn its place on every visit, so it only mentions what's true.
 */
function summarise({
  trips,
  finished,
  kit,
  corrections,
}: {
  trips: number;
  finished: number;
  kit: number;
  corrections: number;
}): string {
  const parts: string[] = [
    `${trips} ${trips === 1 ? "trip" : "trips"} on the board`,
  ];
  if (kit > 0) {
    parts.push(`${kit} ${kit === 1 ? "thing" : "things"} in your inventory`);
  }
  if (corrections > 0) {
    parts.push(
      `${corrections} ${corrections === 1 ? "correction" : "corrections"} learned`,
    );
  }

  const tail =
    finished > 0
      ? ` Your next list already starts from what ${finished === 1 ? "that trip" : "those trips"} taught it.`
      : "";

  return `${parts.join(" · ")}.${tail}`;
}

function NextUp({ trip }: { trip: Trip }) {
  const { packed, total } = packedCount(trip.items);
  const left = total - packed;

  return (
    <div className="mt-6 border-l-2 border-accent bg-surface px-4 py-3">
      <Label>{countdownLabel(trip)}</Label>
      <p className="mt-1 font-display text-subhead text-ink">{trip.name}</p>
      <p className="mt-0.5 text-small text-muted">
        {total === 0
          ? "Nothing on the list yet."
          : left === 0
            ? "Everything's packed."
            : `${left} of ${total} still to pack.`}
      </p>
      <ButtonLink href={`/trips/${trip.id}`} variant="primary" className="mt-3">
        {packed === 0
          ? "Start packing"
          : left === 0
            ? "Have a look"
            : "Carry on packing"}
      </ButtonLink>
    </div>
  );
}
