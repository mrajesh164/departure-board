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
      <h1 className="font-display text-display text-ink">
        The Departure
        <br />
        Board
      </h1>

      <p className="measure mt-5 text-body text-ink">
        A packing list for the trips you take again.
      </p>
      <p className="measure mt-3 text-body text-muted">
        Each trip builds its own list from your dates and the weather where
        you&apos;re going that month. Afterwards you say what you never used and
        what you wished you&apos;d brought — so the next time you pack that
        trip, the list starts already corrected.
      </p>

      <div className="mt-9 border-t-2 border-ink pt-6">
        <StarterTrips />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flow 3 — coming back                                                */
/* ------------------------------------------------------------------ */

function Returning({ trips }: { trips: Trip[] }) {
  const next = nextDeparture(trips);
  const unreviewed = trips.filter(
    (t) => phaseOf(t) === "past" && !t.review,
  ).length;

  return (
    <div data-when="returning">
      <section className="border-b-2 border-ink pb-8">
        <h1 className="font-display text-display text-ink">
          The Departure
          <br />
          Board
        </h1>

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
