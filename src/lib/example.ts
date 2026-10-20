/**
 * The worked example offered on the first visit.
 *
 * The whole premise of this tool is that a list improves each time you pack it
 * — and that is the one thing a first visit cannot show you, because it takes
 * two trips to happen. Describing it in a paragraph is weak; nobody reads the
 * paragraph, and the brief is explicit that people should learn by doing.
 *
 * So the first visit offers a trip that has already been packed twice, with its
 * corrections visible on the list: "Laundry sheets · you added this last time".
 * You can open it, poke at it, and pack it again — the loop is a thing you can
 * operate within ten seconds of arriving rather than a promise.
 *
 * It's labelled an example everywhere it appears and deletes in one action, so
 * it never gets confused with the person's own trips.
 */

import { conditionsFor, findClimate } from "./climate";
import { buildPackingList, monthsSpanned } from "./suggestions";
import type { Item, Trip } from "./types";

const DESTINATION = "Minneapolis";
const CLIMATE_SLUG = "minneapolis";

/** What two previous runs of this trip taught it. */
const LEARNED = {
  add: ["Laundry sheets", "Melatonin"],
  drop: ["Compact umbrella", "Sun hat"],
};

/** Last November, so the example reads as genuinely finished. */
function lastThanksgiving(): { startDate: string; endDate: string } {
  const now = new Date();
  // If it's already December, "last November" is this year's.
  const year = now.getMonth() >= 11 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    startDate: `${year}-11-25`,
    endDate: `${year}-11-29`,
  };
}

export function buildExampleTrip(): Trip {
  const { startDate, endDate } = lastThanksgiving();
  const climate = findClimate(CLIMATE_SLUG);
  const conditions = climate
    ? conditionsFor(climate, monthsSpanned(startDate, endDate))
    : undefined;

  const items: Item[] = conditions
    ? buildPackingList(conditions, 5, LEARNED).map((item) => ({
        ...item,
        // A finished trip was packed, so the list reads as one.
        packed: true,
      }))
    : [];

  return {
    id: crypto.randomUUID(),
    name: "Thanksgiving at my parents'",
    destination: DESTINATION,
    climateSlug: CLIMATE_SLUG,
    startDate,
    endDate,
    items,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    review: {
      neverUsed: LEARNED.drop,
      wishedFor: LEARNED.add,
      reviewedAt: new Date().toISOString(),
    },
    learned: LEARNED,
    isExample: true,
  };
}

/**
 * The corrected items, for the first-visit card to show without anyone having
 * to click into the trip.
 */
export function exampleHighlights(trip: Trip): Item[] {
  return trip.items.filter((i) => i.source === "learned");
}

/** Dismissing the card is remembered, so it doesn't nag on every visit. */
const DISMISS_KEY = "wanderlist.example-dismissed";
const LEGACY_DISMISS_KEY = "departure-board.example-dismissed";

export function exampleDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      window.localStorage.getItem(DISMISS_KEY) === "1" ||
      window.localStorage.getItem(LEGACY_DISMISS_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function dismissExample(): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* private browsing — it'll just reappear next time */
  }
}
