"use client";

import { ButtonLink } from "./Button";

/**
 * How to start, stated once at the top of the first visit.
 *
 * This began as a two-step strip — "build your first list" and "see how it
 * learns", the second anchoring down to the worked example. The second step
 * didn't earn itself: it promised a stage of a process that was really just a
 * card further down the page, so numbering it as step two implied an order that
 * didn't exist.
 *
 * What's left is the actual instruction: build one, or look at a sample. Two
 * routes, stated plainly, rather than a process with stages.
 */

export function FirstVisitSteps() {
  return (
    <section
      aria-label="How to start"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-rule-strong px-4 py-4"
    >
      <div>
        <p className="font-sans text-body font-semibold text-ink">
          Build your first packing list
        </p>
        <p className="mt-0.5 text-small text-muted">
          Or choose from the trips below to view sample lists.
        </p>
      </div>

      {/* Secondary: the accent fill belongs to the starter cards below, which
          are the shorter path to a finished list. */}
      <ButtonLink href="/trips/new" variant="secondary">
        New trip
      </ButtonLink>
    </section>
  );
}
