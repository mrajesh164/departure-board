/**
 * localStorage is the entire backend. No database, no accounts, no network.
 *
 * The one subtlety: a returning person must never see the first-visit screen
 * flash past before React hydrates. So the key is read twice — once by an
 * inline script during HTML parsing (which sets data-has-trips on <html> before
 * the first paint) and once by the provider's lazy useState initializer. Both
 * read the SAME key so React's initial state agrees with the DOM.
 *
 * If you change STORAGE_KEY, HAS_TRIPS_SCRIPT below changes with it — it's
 * interpolated from the same constant on purpose.
 */

import { EMPTY_STATE, type KitItem, type StoredState, type Trip } from "./types";

export const STORAGE_KEY = "wanderlist.v1";

/**
 * The key the app used when it was called The Departure Board.
 *
 * Anyone who saved trips before the rename has them under this. There's no
 * server to migrate from, so the migration happens on the device: the first
 * read that finds the old key and not the new one copies it forward. The old
 * key is left in place rather than deleted — it costs nothing, and it means a
 * half-finished migration can't lose anything.
 */
export const LEGACY_STORAGE_KEY = "departure-board.v1";

/**
 * Runs synchronously in <head> while the HTML is still parsing, so the correct
 * screen is in the DOM before anything is painted.
 *
 * It has to check the legacy key too. On the very first load after the rename
 * the data is still under the old name, and a script that only looked at the
 * new one would report "no trips" and flash the first visit at someone who has
 * six.
 */
export const HAS_TRIPS_SCRIPT = `(function(){try{var raw=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)})||localStorage.getItem(${JSON.stringify(
  LEGACY_STORAGE_KEY,
)});var s=raw?JSON.parse(raw):null;var n=s&&Array.isArray(s.trips)?s.trips.length:0;document.documentElement.setAttribute("data-has-trips",n>0?"yes":"no")}catch(e){document.documentElement.setAttribute("data-has-trips","no")}})()`;

function isTrip(value: unknown): value is Trip {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Partial<Trip>;
  return (
    typeof t.id === "string" &&
    typeof t.name === "string" &&
    typeof t.startDate === "string" &&
    typeof t.endDate === "string" &&
    Array.isArray(t.items)
  );
}

/**
 * Small corrections to labels already sitting in someone's storage. Fixing the
 * spelling in the generator only helps lists built from now on; a trip created
 * yesterday keeps the old wording until it's rewritten here too.
 */
const LABEL_FIXES: Record<string, string> = {
  pyjamas: "Pajamas",
};

function fixLabel(label: string): string {
  return LABEL_FIXES[label.toLowerCase()] ?? label;
}

function isKitItem(value: unknown): value is KitItem {
  if (typeof value !== "object" || value === null) return false;
  const k = value as Partial<KitItem>;
  return typeof k.id === "string" && typeof k.label === "string";
}

/** Keeps a stored count inside the range the stepper can reach, or drops it. */
function validQty(qty: unknown): number | undefined {
  if (typeof qty !== "number" || !Number.isFinite(qty)) return undefined;
  const whole = Math.round(qty);
  if (whole < 1) return undefined;
  return Math.min(99, whole);
}

/**
 * Read and validate. Anything malformed is discarded rather than crashing the
 * app — a person whose storage got mangled should land on the first visit, not
 * a white screen.
 */
export function readState(): StoredState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    /* Fall back to the pre-rename key, then write forward so it only happens
       once. See LEGACY_STORAGE_KEY. */
    let raw = window.localStorage.getItem(STORAGE_KEY);
    let migrating = false;
    if (!raw) {
      raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      migrating = raw !== null;
    }
    if (!raw) return EMPTY_STATE;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_STATE;
    const trips = (parsed as StoredState).trips;
    if (!Array.isArray(trips)) return EMPTY_STATE;

    // `kit` arrived after the first release, so treat it as optional on read.
    const kit = (parsed as StoredState).kit;

    const state: StoredState = {
      version: 1,
      trips: trips.filter(isTrip).map((t) => ({
        ...t,
        items: t.items.map((i) => ({ ...i, label: fixLabel(i.label) })),
        // Older records may predate `learned`; normalize so callers can rely on it.
        learned: {
          drop: (t.learned?.drop ?? []).map(fixLabel),
          add: (t.learned?.add ?? []).map(fixLabel),
        },
      })),
      /* `qty` arrived after `kit` did, so most stored entries don't have one.
         Anything absent or nonsensical is left undefined rather than coerced to
         1 — undefined means "you never said", which the inventory treats
         differently from a number you chose. */
      kit: Array.isArray(kit)
        ? kit.filter(isKitItem).map((k) => ({
            ...k,
            label: fixLabel(k.label),
            qty: validQty(k.qty),
          }))
        : [],
    };

    if (migrating) writeState(state);
    return state;
  } catch {
    return EMPTY_STATE;
  }
}

export function writeState(state: StoredState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Keep the attribute in step so a refresh shows the right screen immediately.
    document.documentElement.setAttribute(
      "data-has-trips",
      state.trips.length > 0 ? "yes" : "no",
    );
  } catch {
    // Private browsing or a full quota. The app keeps working for this session.
  }
}
