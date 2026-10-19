"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTrips } from "@/app/providers";

/**
 * The masthead, shared by every route.
 *
 * It answers "where am I and how do I get back" — the brief's navigation
 * requirement — with a wordmark that's always home plus a breadcrumb naming the
 * trip you're inside. The trip name is read from the one provider, so it can't
 * disagree with the page below it.
 *
 * The breadcrumb sits behind its own Suspense boundary because `usePathname`
 * suspends on /trips/[id], whose param isn't known at build time. Without the
 * boundary that one hook would block prerendering of the entire layout; with it,
 * the masthead is prerendered and only the breadcrumb streams in.
 */

export function Nav() {
  return (
    <header className="border-b-2 border-ink bg-background">
      <div className="mx-auto flex max-w-3xl items-baseline gap-3 px-5 py-4">
        <Link
          href="/"
          className="font-display text-subhead font-semibold tracking-tight text-ink no-underline hover:text-accent"
        >
          The Departure Board
        </Link>

        <Suspense fallback={null}>
          <Breadcrumb />
        </Suspense>
      </div>
    </header>
  );
}

function Breadcrumb() {
  const pathname = usePathname();
  const { trips } = useTrips();

  const tripId = /^\/trips\/([^/]+)/.exec(pathname)?.[1];
  const trip = tripId ? trips.find((t) => t.id === tripId) : undefined;

  const onNew = pathname === "/trips/new";
  const onReview = pathname.endsWith("/review");

  if (!trip && !onNew) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-baseline gap-2 text-small">
      <Separator />
      {onNew ? (
        <Current>A new trip</Current>
      ) : trip && onReview ? (
        <>
          <Link href={`/trips/${trip.id}`} className="text-muted">
            {trip.name}
          </Link>
          <Separator />
          <Current>Review</Current>
        </>
      ) : trip ? (
        <Current>{trip.name}</Current>
      ) : null}
    </nav>
  );
}

function Separator() {
  return (
    <span aria-hidden="true" className="text-rule-strong">
      /
    </span>
  );
}

function Current({ children }: { children: React.ReactNode }) {
  return (
    <span aria-current="page" className="text-muted">
      {children}
    </span>
  );
}
