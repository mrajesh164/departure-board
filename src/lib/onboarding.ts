/**
 * The guided walkthrough.
 *
 * The first visit can show you that a list gets built. It can't show you the
 * rest of the loop — packing, reviewing, and the list improving — because that
 * takes a real trip and a real decision at each stage. An earlier attempt faked
 * it with a pre-packed example trip, which demonstrated the idea but left the
 * person reading about their own tool instead of using it.
 *
 * So the walkthrough uses *their* first trip. Each step is derived from data
 * that already exists — no progress flags to keep in sync, nothing that can
 * claim a step is done when it isn't — and each one links to the place it
 * happens. Finish it and the practice trip can be deleted.
 */

import type { StoredState, Trip } from "./types";
import { phaseOf } from "./trips";

export type OnboardingStep = {
  id: string;
  label: string;
  /** Where the step is performed. */
  href: string;
  done: boolean;
};

const SEEN_INVENTORY_KEY = "departure-board.seen-inventory";
const DISMISSED_KEY = "departure-board.walkthrough-dismissed";

export function markInventorySeen(): void {
  try {
    window.localStorage.setItem(SEEN_INVENTORY_KEY, "1");
  } catch {
    /* private browsing — the step just stays open */
  }
}

export function inventorySeen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SEEN_INVENTORY_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissWalkthrough(): void {
  try {
    window.localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    /* private browsing — it reappears, which is harmless */
  }
}

export function walkthroughDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/** The trip the walkthrough is about: the first one they ever made. */
export function onboardingTrip(trips: Trip[]): Trip | undefined {
  return trips.find((t) => t.isOnboarding);
}

export function onboardingSteps(
  state: Pick<StoredState, "trips" | "kit">,
  seenInventory: boolean,
): OnboardingStep[] {
  const trip = onboardingTrip(state.trips) ?? state.trips[0];
  const here = trip ? `/trips/${trip.id}` : "/";

  return [
    {
      id: "build",
      label: "Build your first list",
      href: "/",
      done: state.trips.length > 0,
    },
    {
      id: "pack",
      label: "Pack a few things",
      href: here,
      done: Boolean(trip?.items.some((i) => i.packed)),
    },
    {
      id: "review",
      label: "Finish it and say what you didn't need",
      href: trip ? `/trips/${trip.id}/review` : "/",
      done: Boolean(trip?.review),
    },
    {
      id: "learned",
      label: "See what it learned",
      href: "/inventory",
      done: seenInventory,
    },
  ];
}

export function onboardingComplete(steps: OnboardingStep[]): boolean {
  return steps.every((s) => s.done);
}

/** The first step still outstanding — what the strip should point at. */
export function currentStep(steps: OnboardingStep[]): OnboardingStep | undefined {
  return steps.find((s) => !s.done);
}

/**
 * Whether to show the walkthrough at all.
 *
 * Finishing the steps doesn't hide it — the completion panel is where the
 * practice trip gets cleaned up, so hiding on completion made that unreachable.
 * It goes away when explicitly dismissed, which deleting the practice trip also
 * counts as, or once someone has clearly moved on: two real trips in, nobody
 * needs step one explained.
 */
export function showWalkthrough(
  state: Pick<StoredState, "trips" | "kit">,
  seenInventory: boolean,
  dismissed: boolean = walkthroughDismissed(),
): boolean {
  if (dismissed) return false;
  const realTrips = state.trips.filter(
    (t) => !t.isOnboarding && phaseOf(t) !== "past",
  ).length;
  return realTrips < 2;
}
