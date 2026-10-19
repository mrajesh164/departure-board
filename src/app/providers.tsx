"use client";

/**
 * The single source of truth for trips.
 *
 * This provider lives in the root layout, which matters more than it looks:
 * with `cacheComponents` on, Next keeps recently visited routes mounted via
 * React <Activity> instead of unmounting them. If each route held its own copy
 * of the trips state, navigating back to a route would show you a stale copy.
 * One provider above the routes avoids that entirely.
 *
 * Hydration: the first render returns EMPTY_STATE so it matches what the server
 * rendered — no mismatch. A useLayoutEffect then loads real data *before paint*,
 * and the inline script in <head> has already hidden the wrong branch via
 * data-has-trips, so a returning person never sees the first-visit screen.
 */

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { readState, writeState } from "@/lib/storage";
import { EMPTY_STATE, type StoredState, type Item, type Trip } from "@/lib/types";

type TripsContextValue = {
  trips: Trip[];
  /** False until storage has been read; lets the UI hold a quiet placeholder. */
  ready: boolean;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, patch: (trip: Trip) => Trip) => void;
  removeTrip: (id: string) => void;
  toggleItem: (tripId: string, itemId: string) => void;
  setItemQty: (tripId: string, itemId: string, qty: number) => void;
  /** Adds an item and remembers it for the next run of this trip. */
  addItem: (tripId: string, item: Item) => void;
  /** Removes an item and remembers not to suggest it next time. */
  removeItem: (tripId: string, itemId: string) => void;
  /** Replace everything — used when restoring an export. */
  replaceAll: (trips: Trip[]) => void;
  resetEverything: () => void;
};

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);

  // Runs before the browser paints, so real data is on screen in the first frame
  // the user actually sees.
  useLayoutEffect(() => {
    setState(readState());
    setReady(true);
  }, []);

  const commit = useCallback((next: StoredState) => {
    setState(next);
    writeState(next);
  }, []);

  const addTrip = useCallback(
    (trip: Trip) => {
      setState((prev) => {
        const next = { ...prev, trips: [...prev.trips, trip] };
        writeState(next);
        return next;
      });
    },
    [],
  );

  const updateTrip = useCallback((id: string, patch: (trip: Trip) => Trip) => {
    setState((prev) => {
      const next = {
        ...prev,
        trips: prev.trips.map((t) => (t.id === id ? patch(t) : t)),
      };
      writeState(next);
      return next;
    });
  }, []);

  const removeTrip = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, trips: prev.trips.filter((t) => t.id !== id) };
      writeState(next);
      return next;
    });
  }, []);

  const toggleItem = useCallback(
    (tripId: string, itemId: string) => {
      updateTrip(tripId, (trip) => ({
        ...trip,
        items: trip.items.map((i) =>
          i.id === itemId ? { ...i, packed: !i.packed } : i,
        ),
      }));
    },
    [updateTrip],
  );

  const setItemQty = useCallback(
    (tripId: string, itemId: string, qty: number) => {
      const clamped = Math.max(1, Math.min(99, Math.round(qty)));
      updateTrip(tripId, (trip) => ({
        ...trip,
        items: trip.items.map((i) =>
          i.id === itemId ? { ...i, qty: clamped } : i,
        ),
      }));
    },
    [updateTrip],
  );

  /**
   * Adding by hand is a correction, not just an edit: the label goes into
   * `learned.add` so the next run of this trip starts with it already there.
   */
  const addItem = useCallback(
    (tripId: string, item: Item) => {
      updateTrip(tripId, (trip) => {
        const key = item.label.toLowerCase();
        return {
          ...trip,
          items: [...trip.items, item],
          learned: {
            // If it was previously dropped, un-drop it — the person changed their mind.
            drop: trip.learned.drop.filter((d) => d.toLowerCase() !== key),
            add: trip.learned.add.some((a) => a.toLowerCase() === key)
              ? trip.learned.add
              : [...trip.learned.add, item.label],
          },
        };
      });
    },
    [updateTrip],
  );

  /**
   * Removing is the mirror image. A suggested item goes onto `learned.drop` so
   * it stops being offered; a hand-added one simply comes back off `learned.add`
   * rather than being recorded as a rejection of a suggestion we never made.
   */
  const removeItem = useCallback(
    (tripId: string, itemId: string) => {
      updateTrip(tripId, (trip) => {
        const item = trip.items.find((i) => i.id === itemId);
        if (!item) return trip;
        const key = item.label.toLowerCase();
        const wasHandAdded = trip.learned.add.some(
          (a) => a.toLowerCase() === key,
        );
        return {
          ...trip,
          items: trip.items.filter((i) => i.id !== itemId),
          learned: {
            add: trip.learned.add.filter((a) => a.toLowerCase() !== key),
            drop:
              wasHandAdded || trip.learned.drop.some((d) => d.toLowerCase() === key)
                ? trip.learned.drop
                : [...trip.learned.drop, item.label],
          },
        };
      });
    },
    [updateTrip],
  );

  const replaceAll = useCallback(
    (next: Trip[]) => {
      commit({ version: 1, trips: next });
    },
    [commit],
  );

  const resetEverything = useCallback(() => {
    commit(EMPTY_STATE);
  }, [commit]);

  const value = useMemo<TripsContextValue>(
    () => ({
      trips: state.trips,
      ready,
      addTrip,
      updateTrip,
      removeTrip,
      toggleItem,
      setItemQty,
      addItem,
      removeItem,
      replaceAll,
      resetEverything,
    }),
    [
      state.trips,
      ready,
      addTrip,
      updateTrip,
      removeTrip,
      toggleItem,
      setItemQty,
      addItem,
      removeItem,
      replaceAll,
      resetEverything,
    ],
  );

  return <TripsContext value={value}>{children}</TripsContext>;
}

export function useTrips(): TripsContextValue {
  const ctx = useContext(TripsContext);
  if (!ctx) {
    throw new Error("useTrips must be used inside <TripsProvider>");
  }
  return ctx;
}

/** Convenience for the trip routes. */
export function useTrip(id: string): Trip | undefined {
  const { trips } = useTrips();
  return trips.find((t) => t.id === id);
}
