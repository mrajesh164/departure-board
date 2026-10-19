/**
 * Derived facts about trips: how far away, how packed, what to show first.
 * Pure functions, no React, no storage — so they're easy to reason about.
 */

import type { Item, Trip } from "./types";
import {
  conditionsFor,
  findClimate,
  manualConditions,
  type Conditions,
} from "./climate";
import { monthsSpanned, tripLengthDays } from "./suggestions";

/** Today as YYYY-MM-DD in the viewer's own timezone. */
export function todayISO(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** Whole days from today until a date. Negative once it's in the past. */
export function daysUntil(date: string, from: string = todayISO()): number {
  const a = Date.parse(from + "T00:00:00");
  const b = Date.parse(date + "T00:00:00");
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

export type TripPhase = "upcoming" | "in-progress" | "past";

export function phaseOf(trip: Trip, today: string = todayISO()): TripPhase {
  if (trip.completedAt) return "past";
  if (daysUntil(trip.endDate, today) < 0) return "past";
  if (daysUntil(trip.startDate, today) <= 0) return "in-progress";
  return "upcoming";
}

/** "in 3 days", "tomorrow", "today", "last March" — the board's lead line. */
export function countdownLabel(trip: Trip, today: string = todayISO()): string {
  const phase = phaseOf(trip, today);
  if (phase === "in-progress") return "Happening now";
  if (phase === "past") return "Finished";
  const d = daysUntil(trip.startDate, today);
  if (d === 0) return "Leaves today";
  if (d === 1) return "Leaves tomorrow";
  if (d < 7) return `In ${d} days`;
  if (d < 14) return "Next week";
  if (d < 31) return `In ${Math.round(d / 7)} weeks`;
  const months = Math.round(d / 30);
  return months <= 1 ? "In a month" : `In ${months} months`;
}

export function formatDateRange(start: string, end: string): string {
  const a = new Date(start + "T00:00:00");
  const b = new Date(end + "T00:00:00");
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
  const sameMonth =
    a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const month = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  if (start === end) return `${month(a)} ${a.getDate()}`;
  if (sameMonth) return `${month(a)} ${a.getDate()}–${b.getDate()}`;
  return `${month(a)} ${a.getDate()} – ${month(b)} ${b.getDate()}`;
}

export function packedCount(items: Item[]): { packed: number; total: number } {
  return {
    packed: items.filter((i) => i.packed).length,
    total: items.length,
  };
}

export function lengthOf(trip: Trip): number {
  return tripLengthDays(trip.startDate, trip.endDate);
}

/** Conditions for a trip: from the climate table, or the manual fallback. */
export function conditionsOf(trip: Trip): Conditions | undefined {
  const climate = findClimate(trip.climateSlug);
  if (climate) {
    return conditionsFor(climate, monthsSpanned(trip.startDate, trip.endDate));
  }
  if (trip.manualBand && trip.manualWetness) {
    return manualConditions(trip.manualBand, trip.manualWetness);
  }
  return undefined;
}

/**
 * Board order: whatever needs attention soonest comes first. In-progress trips
 * lead, then upcoming by departure date, then finished trips at the bottom.
 */
export function sortForBoard(trips: Trip[], today: string = todayISO()): Trip[] {
  const rank: Record<TripPhase, number> = {
    "in-progress": 0,
    upcoming: 1,
    past: 2,
  };
  return [...trips].sort((a, b) => {
    const pa = rank[phaseOf(a, today)];
    const pb = rank[phaseOf(b, today)];
    if (pa !== pb) return pa - pb;
    // Past trips read most-recent-first; everything else soonest-first.
    if (pa === 2) return b.startDate.localeCompare(a.startDate);
    return a.startDate.localeCompare(b.startDate);
  });
}

/** The single trip the board should lead with, if any. */
export function nextDeparture(
  trips: Trip[],
  today: string = todayISO(),
): Trip | undefined {
  return sortForBoard(trips, today).find(
    (t) => phaseOf(t, today) !== "past",
  );
}

/**
 * A finished trip that hasn't been reviewed yet. This is the other half of
 * "coming back" — the prompt that makes next time's list better.
 */
export function awaitingReview(
  trips: Trip[],
  today: string = todayISO(),
): Trip | undefined {
  return sortForBoard(trips, today).find(
    (t) => phaseOf(t, today) === "past" && !t.review,
  );
}
