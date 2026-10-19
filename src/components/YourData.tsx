"use client";

import { useRef, useState } from "react";
import { Button } from "./Button";
import { Label } from "./Card";
import { useTrips } from "@/app/providers";
import { readState } from "@/lib/storage";
import type { Trip } from "@/lib/types";

/**
 * Take your trips with you.
 *
 * This exists because of a pattern in the research: PackPoint reviewers report
 * losing customised lists on reinstall with no backup, and this app is in a
 * strictly worse position — everything is in localStorage on one device, so
 * clearing site data is unrecoverable. A tool whose whole value is a list you've
 * corrected over several trips cannot also be a tool that silently loses it.
 *
 * Export is a plain JSON download. Import validates through the same reader the
 * app itself uses, so a corrupt or hand-edited file can't poison storage.
 */

export function YourData() {
  const { trips, replaceAll } = useTrips();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  function exportTrips() {
    const blob = new Blob(
      [JSON.stringify({ version: 1, trips, exportedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `departure-board-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setError(undefined);
    setMessage(`Saved ${trips.length} ${trips.length === 1 ? "trip" : "trips"} to your downloads.`);
  }

  async function importTrips(file: File) {
    setMessage(undefined);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const incoming = (parsed as { trips?: unknown })?.trips;
      if (!Array.isArray(incoming)) {
        setError("That file doesn't look like a Departure Board export.");
        return;
      }

      // Validate by round-tripping through the app's own reader rather than
      // trusting the file: anything malformed is dropped, not stored.
      const before = readState();
      localStorage.setItem(
        "departure-board.v1",
        JSON.stringify({ version: 1, trips: incoming }),
      );
      const valid = readState().trips;
      localStorage.setItem("departure-board.v1", JSON.stringify(before));

      if (valid.length === 0) {
        setError("No usable trips in that file. Nothing was changed.");
        return;
      }

      replaceAll(valid as Trip[]);
      setError(undefined);
      setMessage(
        `Restored ${valid.length} ${valid.length === 1 ? "trip" : "trips"}.` +
          (valid.length < incoming.length
            ? ` ${incoming.length - valid.length} couldn't be read and were skipped.`
            : ""),
      );
    } catch {
      setError("That file couldn't be read. Is it the JSON you exported?");
    }
  }

  return (
    <section className="mt-10 border-t border-rule pt-4">
      <Label>Your data</Label>
      <p className="measure mt-1 text-small text-muted">
        Everything lives in this browser on this device. Clearing site data
        erases it, so keep a copy of anything you&apos;ve spent a few trips
        getting right.
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        <Button onClick={exportTrips} disabled={trips.length === 0}>
          Export my trips
        </Button>
        <Button onClick={() => fileRef.current?.click()}>Restore from a file</Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Choose a Departure Board export to restore"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importTrips(file);
            // Reset so choosing the same file twice still fires a change event.
            e.target.value = "";
          }}
        />
      </div>

      <p aria-live="polite" className="mt-2 text-small text-success">
        {message ?? ""}
      </p>
      {error && (
        <p
          role="alert"
          className="mt-2 flex items-start gap-2 border-l-2 border-error bg-selected px-2.5 py-1.5 text-small text-error"
        >
          <span aria-hidden="true" className="font-semibold">
            !
          </span>
          <span>{error}</span>
        </p>
      )}
    </section>
  );
}
