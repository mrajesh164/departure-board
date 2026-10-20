"use client";

import Link from "next/link";
import { useTrips } from "@/app/providers";
import { Button } from "./Button";
import { Label } from "./Card";
import {
  currentStep,
  dismissWalkthrough,
  onboardingComplete,
  onboardingTrip,
  type OnboardingStep,
} from "@/lib/onboarding";

/**
 * The walkthrough strip: four steps, each a link to where it happens.
 *
 * Every step's done-ness is derived from real data, so it can't lie — the box
 * is ticked because a trip exists, an item is packed, a review was saved. It
 * walks someone through the whole loop using their own first trip rather than a
 * demonstration of it.
 */

export function OnboardingSteps({
  steps,
  onDismiss,
}: {
  steps: OnboardingStep[];
  onDismiss: () => void;
}) {
  const { trips, removeTrip } = useTrips();
  const complete = onboardingComplete(steps);
  const current = currentStep(steps);
  const practice = onboardingTrip(trips);

  if (complete) {
    return (
      <section className="border-y-2 border-success bg-surface px-4 py-4">
        <Label>That&apos;s the whole loop</Label>
        <p className="measure mt-1 text-body text-ink">
          You built a list, packed from it, told it what you didn&apos;t need,
          and it remembered. Every trip from here starts closer to right.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {practice && (
            <Button
              variant="secondary"
              onClick={() => {
                removeTrip(practice.id);
                dismissWalkthrough();
                onDismiss();
              }}
            >
              Delete the practice trip
            </Button>
          )}
          <Button
            variant="quiet"
            onClick={() => {
              dismissWalkthrough();
              onDismiss();
            }}
          >
            {practice ? "Keep it" : "Got it"}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Getting started" className="border-y border-rule-strong">
      <ol className="flex flex-wrap items-stretch">
        {steps.map((step, i) => {
          const isCurrent = current?.id === step.id;
          return (
            <li
              key={step.id}
              className={`min-w-44 flex-1 ${i > 0 ? "border-l border-rule-strong" : ""}`}
            >
              <Link
                href={step.href}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex h-full items-center gap-3 px-4 py-3 no-underline hover:bg-selected ${
                  isCurrent ? "bg-selected" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-6 shrink-0 place-items-center border font-sans text-small font-semibold ${
                    step.done
                      ? "border-success bg-success text-surface"
                      : isCurrent
                        ? "border-accent bg-accent text-surface"
                        : "border-rule-strong bg-surface text-muted"
                  }`}
                >
                  {step.done ? "✓" : i + 1}
                </span>
                <span
                  className={`font-sans text-small ${
                    step.done
                      ? "text-muted line-through decoration-rule-strong"
                      : isCurrent
                        ? "font-semibold text-ink"
                        : "text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
