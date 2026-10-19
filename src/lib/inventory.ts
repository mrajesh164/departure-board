/**
 * Your kit, assembled from every trip you've taken.
 *
 * This isn't a second database of things you own — that would be a chore to
 * maintain and would go stale immediately. It's a *view* over the trips that
 * already exist: every item that has ever been on a list, how often it actually
 * went in the bag, and what the board has learned about it.
 *
 * It exists because the learning loop is otherwise invisible. Corrections live
 * inside individual trips, so there's no single place to see that you've
 * carried an umbrella on six trips and used it twice, or that laundry sheets
 * started as something you added by hand and are now standard. This is that
 * place.
 */

import type { ItemCategory, Trip } from "./types";
import { phaseOf } from "./trips";

export type KitEntry = {
  label: string;
  category: ItemCategory;
  /** How many trips this has appeared on. */
  onTrips: number;
  /** How many times you actually checked it off. */
  packedTimes: number;
  /** How many finished trips it was on but never ticked. */
  unpackedOnFinished: number;
  /** You asked for this after a trip, so it's now suggested. */
  requested: boolean;
  /** You've told some trip to stop suggesting it. */
  dropped: boolean;
  /** You typed it in yourself rather than it being suggested. */
  yourOwn: boolean;
  /** Most recent trip it appeared on. */
  lastSeenOn?: string;
};

export function buildInventory(trips: Trip[]): KitEntry[] {
  const byLabel = new Map<string, KitEntry>();

  const touch = (label: string, category: ItemCategory): KitEntry => {
    const key = label.toLowerCase();
    let entry = byLabel.get(key);
    if (!entry) {
      entry = {
        label,
        category,
        onTrips: 0,
        packedTimes: 0,
        unpackedOnFinished: 0,
        requested: false,
        dropped: false,
        yourOwn: false,
        lastSeenOn: undefined,
      };
      byLabel.set(key, entry);
    }
    return entry;
  };

  // Oldest first, so lastSeenOn ends up genuinely last.
  const chronological = [...trips].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );

  for (const trip of chronological) {
    const finished = phaseOf(trip) === "past";

    for (const item of trip.items) {
      const entry = touch(item.label, item.category);
      entry.onTrips += 1;
      entry.lastSeenOn = trip.name;
      if (item.packed) entry.packedTimes += 1;
      else if (finished) entry.unpackedOnFinished += 1;
      if (item.source === "manual") entry.yourOwn = true;
      if (item.source === "learned") entry.requested = true;
    }

    /* Corrections can outlive the items themselves: something dropped from a
       trip no longer appears in its item list, but is still a fact about your
       kit. Record it either way. */
    for (const label of trip.learned.add) {
      const entry = touch(label, "Extras");
      entry.requested = true;
    }
    for (const label of trip.learned.drop) {
      const entry = touch(label, "Extras");
      entry.dropped = true;
    }
  }

  return [...byLabel.values()].sort(
    (a, b) => b.onTrips - a.onTrips || a.label.localeCompare(b.label),
  );
}

export type KitSummary = {
  distinctItems: number;
  tripCount: number;
  /** Carried on a finished trip and never ticked — candidates to drop. */
  deadWeight: KitEntry[];
  /** Things you added yourself that are now part of the standard list. */
  earned: KitEntry[];
  /** Things you've told the board to stop suggesting. */
  retired: KitEntry[];
};

export function summarise(entries: KitEntry[], trips: Trip[]): KitSummary {
  return {
    distinctItems: entries.length,
    tripCount: trips.length,
    deadWeight: entries.filter(
      (e) => !e.dropped && e.unpackedOnFinished > 0 && e.packedTimes === 0,
    ),
    earned: entries.filter((e) => (e.yourOwn || e.requested) && !e.dropped),
    retired: entries.filter((e) => e.dropped),
  };
}
