"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Field, TextInput } from "./Field";
import { Label } from "./Card";
import { useTrips } from "@/app/providers";
import { formatDateRange, relist } from "@/lib/trips";
import type { Trip } from "@/lib/types";

/**
 * Change when a trip happens, and rebuild the list for the new dates.
 *
 * Plans move. Comparable tools handle this badly enough that reviewers
 * complain — PackPoint has no way to change dates short of recreating the
 * trip — so this is a deliberate inclusion rather than a nice-to-have.
 *
 * The rebuild keeps everything already checked off and everything added by
 * hand; see relist() in lib/trips.ts.
 */

export function EditDates({ trip }: { trip: Trip }) {
  const { updateTrip } = useTrips();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(trip.startDate);
  const [endDate, setEndDate] = useState(trip.endDate);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState<string>();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!startDate) return setError("Pick a start date.");
    if (!endDate) return setError("Pick an end date.");
    if (endDate < startDate) {
      return setError("End the trip on or after it starts.");
    }

    const before = trip.items.length;
    updateTrip(trip.id, (t) => relist(t, startDate, endDate));
    setError(undefined);
    setOpen(false);
    setDone(
      `Moved to ${formatDateRange(startDate, endDate)}. The list was rebuilt${
        before ? ", and anything you'd already packed stayed packed" : ""
      }.`,
    );
  }

  if (!open) {
    return (
      <>
        <Button variant="quiet" onClick={() => setOpen(true)}>
          Change the dates
        </Button>
        <p aria-live="polite" className="text-small text-success">
          {done ?? ""}
        </p>
      </>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="w-full border border-rule bg-surface p-4">
      <Label>Change the dates</Label>
      <p className="measure mb-4 mt-1 text-small text-muted">
        The list rebuilds for the new dates and the new month&apos;s weather.
        Anything you&apos;ve already packed or added yourself stays.
      </p>

      <div className="flex flex-col gap-x-4 sm:flex-row">
        <div className="flex-1">
          <Field label="First day">
            {(props) => (
              <TextInput
                {...props}
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (error) setError(undefined);
                }}
              />
            )}
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Last day" error={error}>
            {(props) => (
              <TextInput
                {...props}
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (error) setError(undefined);
                }}
              />
            )}
          </Field>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" variant="primary">
          Move the trip
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            setStartDate(trip.startDate);
            setEndDate(trip.endDate);
            setError(undefined);
            setOpen(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
