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
  addItem: (tripId: string, item: Item) => void;
  removeItem: (tripId: string, itemId: string) => void;
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

  const addItem = useCallback(
    (tripId: string, item: Item) => {
      updateTrip(tripId, (trip) => ({ ...trip, items: [...trip.items, item] }));
    },
    [updateTrip],
  );

  const removeItem = useCallback(
    (tripId: string, itemId: string) => {
      updateTrip(tripId, (trip) => ({
        ...trip,
        items: trip.items.filter((i) => i.id !== itemId),
      }));
    },
    [updateTrip],
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
      addItem,
      removeItem,
      resetEverything,
    }),
    [
      state.trips,
      ready,
      addTrip,
      updateTrip,
      removeTrip,
      toggleItem,
      addItem,
      removeItem,
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
