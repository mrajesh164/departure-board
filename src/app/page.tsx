"use client";

import Link from "next/link";
import { useTrips } from "./providers";
import { ButtonLink } from "@/components/Button";
import { Label } from "@/components/Card";
import { DESTINATION_PHOTOS } from "@/lib/photos";
import {
  countdownLabel,
  nextDeparture,
  packedCount,
  phaseOf,
} from "@/lib/trips";

/**
 * The front door.
 *
 * It does two jobs. For someone who's never been here it says what the thing is
 * and offers three obvious ways in. For someone coming back it leads with the
 * live state — the next departure and what's still unpacked — so the home page
 * isn't a toll gate between them and the list they came to finish.
 */

const SECTIONS = [
  {
    href: "/trips",
    label: "Upcoming",
    title: "The trips you have",
    blurb:
      "Every trip on one board, soonest first, each showing what's still left to pack.",
    photo: DESTINATION_PHOTOS["lisbon"],
    alt: "Lisbon",
  },
  {
    href: "/trips/new",
    label: "New trip",
    title: "Start a new one",
    blurb:
      "Give it a name, a destination and dates. The packing list builds itself from there.",
    photo: DESTINATION_PHOTOS["tokyo"],
    alt: "Tokyo",
  },
  {
    href: "/inventory",
    label: "Inventory",
    title: "What you own",
    blurb:
      "Everything you carry, how often it actually gets packed, and what you've retired.",
    photo: DESTINATION_PHOTOS["reykjavik"],
    alt: "Reykjavík",
  },
] as const;

export default function HomePage() {
  const { trips, ready } = useTrips();

  const next = ready ? nextDeparture(trips) : undefined;
  const unreviewed = ready
    ? trips.filter((t) => phaseOf(t) === "past" && !t.review).length
    : 0;

  return (
    <>
      <section className="border-b-2 border-ink pb-8">
        <h1 className="font-display text-display text-ink">
          The Departure
          <br />
          Board
        </h1>
        <p className="measure mt-5 text-body text-muted">
          A packing list for the trips you take again. Each one builds itself
          from your dates, the weather where you&apos;re going that month, and
          whatever you worked out last time — so the second time you pack
          something, you aren&apos;t starting over.
        </p>

        {/* Returning state leads, when there is one. */}
        {next && <NextUp trip={next} />}

        {ready && !next && trips.length === 0 && (
          <ButtonLink href="/trips" variant="primary" className="mt-6">
            Pack your first trip
          </ButtonLink>
        )}

        {ready && !next && trips.length > 0 && (
          <ButtonLink href="/trips/new" variant="primary" className="mt-6">
            Plan your next trip
          </ButtonLink>
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
    </>
  );
}

function NextUp({ trip }: { trip: ReturnType<typeof nextDeparture> }) {
  if (!trip) return null;
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
      <ButtonLink
        href={`/trips/${trip.id}`}
        variant="primary"
        className="mt-3"
      >
        {packed === 0 ? "Start packing" : left === 0 ? "Have a look" : "Carry on packing"}
      </ButtonLink>
    </div>
  );
}
