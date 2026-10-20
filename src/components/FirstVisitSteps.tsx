"use client";

/**
 * Two steps across the top of the first visit.
 *
 * The worked example sits below the starter cards, which means it's off-screen
 * on arrival — and it's the half that carries the actual idea. Rather than
 * reorder them (the first useful action should still come first), this says up
 * front that there are two things here and gives the second one a way up.
 *
 * It's in-page navigation, not a tour: two links, no copy to read, and the
 * thing it points at is a working trip rather than an explanation.
 */

const STEPS = [
  { href: "#start", n: 1, label: "Build your first list" },
  { href: "#example", n: 2, label: "See how it learns" },
] as const;

export function FirstVisitSteps() {
  return (
    <nav
      aria-label="What's on this page"
      className="flex flex-wrap items-stretch border-y border-rule-strong"
    >
      {STEPS.map((step, i) => (
        <a
          key={step.href}
          href={step.href}
          className={`group flex flex-1 items-center gap-3 px-4 py-3 no-underline hover:bg-selected ${
            i > 0 ? "border-l border-rule-strong" : ""
          }`}
        >
          <span
            aria-hidden="true"
            className="grid size-6 shrink-0 place-items-center border border-ink bg-surface font-sans text-small font-semibold text-ink"
          >
            {step.n}
          </span>
          <span className="font-sans text-small text-ink group-hover:text-accent">
            {step.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
