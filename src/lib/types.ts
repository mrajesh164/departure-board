import type { TempBand, Wetness } from "./climate";

/**
 * Dates are stored as "YYYY-MM-DD" strings rather than Date objects, so what
 * lands in localStorage stays readable and doesn't shift by a day depending on
 * the reader's timezone.
 */
export type DateString = string;

export type ItemCategory =
  | "Outerwear"
  | "Clothing"
  | "Footwear"
  | "Toiletries"
  | "Tech"
  | "Documents"
  | "Extras";

export const CATEGORY_ORDER: ItemCategory[] = [
  "Documents",
  "Outerwear",
  "Clothing",
  "Footwear",
  "Toiletries",
  "Tech",
  "Extras",
];

/** Why an item is on the list — shown to explain the tool's reasoning. */
export type ItemSource =
  | "essential" /* every trip needs it */
  | "climate" /* because of the weather there that month */
  | "duration" /* quantity came from the trip length */
  | "learned" /* you asked for it after a previous trip */
  | "manual"; /* you typed it */

export type Item = {
  id: string;
  label: string;
  qty: number;
  category: ItemCategory;
  source: ItemSource;
  packed: boolean;
};

export type TripReview = {
  /** Item labels you marked as never used — dropped next time. */
  neverUsed: string[];
  /** Things you wished you'd brought — added next time. */
  wishedFor: string[];
  reviewedAt: string;
};

export type Trip = {
  id: string;
  /** What you call this trip: "Thanksgiving at my parents'". */
  name: string;
  /** Free text, shown on the board. */
  destination: string;
  /** Slug into the climate table, when the destination matched one. */
  climateSlug?: string;
  /** Set only when the destination isn't in the climate table. */
  manualBand?: TempBand;
  manualWetness?: Wetness;
  startDate: DateString;
  endDate: DateString;
  items: Item[];
  createdAt: string;
  /** Set when you mark the trip finished; moves it off the upcoming board. */
  completedAt?: string;
  review?: TripReview;
  /**
   * Corrections carried forward from every past run of this trip. This is the
   * "it remembers" part: pack it again and the list starts already fixed.
   */
  learned: {
    drop: string[];
    add: string[];
  };
};

export type StoredState = {
  version: 1;
  trips: Trip[];
};

export const EMPTY_STATE: StoredState = { version: 1, trips: [] };
