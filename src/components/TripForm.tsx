"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { Field, Select, TextInput } from "./Field";
import { Label } from "./Card";
import { useTrips } from "@/app/providers";
import {
  BAND_LABEL,
  CLIMATES,
  MONTHS,
  WETNESS_LABEL,
  conditionsFor,
  describeConditions,
  findClimate,
  manualConditions,
  searchClimates,
  type TempBand,
  type Wetness,
} from "@/lib/climate";
import {
  buildPackingList,
  monthsSpanned,
  tripLengthDays,
} from "@/lib/suggestions";
import type { Trip } from "@/lib/types";

/**
 * One column, a label on every field, and errors that sit beside the field they
 * belong to and say what to do next.
 *
 * Validation runs on submit against React state and only ever *sets* errors —
 * it never touches the values — so a failed submit keeps everything typed.
 */

type Errors = Partial<
  Record<"name" | "destination" | "startDate" | "endDate", string>
>;

export function TripForm({ repeatOf }: { repeatOf?: Trip }) {
  const { addTrip } = useTrips();
  const router = useRouter();

  const [name, setName] = useState(repeatOf?.name ?? "");
  const [destination, setDestination] = useState(repeatOf?.destination ?? "");
  const [climateSlug, setClimateSlug] = useState(repeatOf?.climateSlug ?? "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [band, setBand] = useState<TempBand>(repeatOf?.manualBand ?? "mild");
  const [wetness, setWetness] = useState<Wetness>(
    repeatOf?.manualWetness ?? "some-rain",
  );
  const [errors, setErrors] = useState<Errors>({});

  /**
   * Resolve the destination to a climate from either an explicit pick or an
   * exact name match. Without the second half, typing "Minneapolis" in full and
   * pressing submit — rather than clicking the suggestion — silently fell
   * through to generic "mild" conditions for a city we have real data for.
   */
  const climate = useMemo(() => {
    if (climateSlug) return findClimate(climateSlug);
    const typed = destination.trim().toLowerCase();
    if (!typed) return undefined;
    return CLIMATES.find((c) => c.city.toLowerCase() === typed);
  }, [climateSlug, destination]);

  /* Once it's resolved, the suggestion list has nothing left to offer. */
  const matches = useMemo(
    () => (climate ? [] : searchClimates(destination)),
    [destination, climate],
  );

  /* The destination isn't in the table, so ask rather than guess. Not an error —
     a trip to a village in the Alps is a perfectly good trip. */
  const needsManualConditions = destination.trim().length > 0 && !climate;

  /* Live preview: what this form is about to build. */
  const preview = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return undefined;
    const days = tripLengthDays(startDate, endDate);
    const conditions = climate
      ? conditionsFor(climate, monthsSpanned(startDate, endDate))
      : needsManualConditions
        ? manualConditions(band, wetness)
        : undefined;
    if (!conditions) return undefined;
    return {
      days,
      conditions,
      count: buildPackingList(conditions, days, repeatOf?.learned).length,
    };
  }, [startDate, endDate, climate, needsManualConditions, band, wetness, repeatOf]);

  function pickDestination(slug: string, city: string) {
    setClimateSlug(slug);
    setDestination(city);
    setErrors((e) => ({ ...e, destination: undefined }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const next: Errors = {};
    if (!name.trim()) next.name = "Name this trip so you can find it again.";
    if (!destination.trim()) next.destination = "Enter a destination.";
    if (!startDate) next.startDate = "Pick a start date.";
    if (!endDate) next.endDate = "Pick an end date.";
    else if (startDate && endDate < startDate) {
      next.endDate = "End the trip on or after it starts.";
    }

    if (Object.keys(next).length > 0) {
      // Only errors change. Every typed value stays exactly where it is.
      setErrors(next);
      return;
    }

    const days = tripLengthDays(startDate, endDate);
    const conditions = climate
      ? conditionsFor(climate, monthsSpanned(startDate, endDate))
      : manualConditions(band, wetness);

    const trip: Trip = {
      id: crypto.randomUUID(),
      name: name.trim(),
      destination: destination.trim(),
      climateSlug: climate ? climate.slug : undefined,
      manualBand: climate ? undefined : band,
      manualWetness: climate ? undefined : wetness,
      startDate,
      endDate,
      items: buildPackingList(conditions, days, repeatOf?.learned),
      createdAt: new Date().toISOString(),
      // Carry the corrections forward — this is what makes a repeat cheap.
      learned: repeatOf?.learned ?? { drop: [], add: [] },
    };

    addTrip(trip);
    router.push(`/trips/${trip.id}`);
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-xl">
      {repeatOf && (
        <p className="mb-6 border-l-2 border-success bg-surface px-3 py-2 text-small text-ink">
          Packing <strong>{repeatOf.name}</strong> again. Your
          corrections from last time are already applied — just pick the new
          dates.
        </p>
      )}

      <Field
        label="What's the trip?"
        hint="However you'd refer to it: “Thanksgiving at my parents'”."
        error={errors.name}
      >
        {(props) => (
          <TextInput
            {...props}
            value={name}
            placeholder="Thanksgiving at my parents'"
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((x) => ({ ...x, name: undefined }));
            }}
          />
        )}
      </Field>

      <Field
        label="Where are you going?"
        hint="Start typing — we know the usual weather for a few places."
        error={errors.destination}
      >
        {(props) => (
          <>
            <TextInput
              {...props}
              value={destination}
              autoComplete="off"
              placeholder="Lisbon"
              onChange={(e) => {
                setDestination(e.target.value);
                setClimateSlug("");
                if (errors.destination) {
                  setErrors((x) => ({ ...x, destination: undefined }));
                }
              }}
            />
            {matches.length > 0 && (
              <ul className="mt-1 border border-rule-strong bg-surface">
                {matches.map((c) => (
                  <li key={c.slug}>
                    <button
                      type="button"
                      onClick={() => pickDestination(c.slug, c.city)}
                      className="block w-full px-3 py-1.5 text-left text-small text-ink hover:bg-selected"
                    >
                      {c.city}
                      <span className="text-muted"> · {c.region}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Field>

      <Field label="First day" error={errors.startDate}>
        {(props) => (
          <TextInput
            {...props}
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (errors.startDate) {
                setErrors((x) => ({ ...x, startDate: undefined }));
              }
            }}
          />
        )}
      </Field>

      <Field label="Last day" error={errors.endDate}>
        {(props) => (
          <TextInput
            {...props}
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (errors.endDate) {
                setErrors((x) => ({ ...x, endDate: undefined }));
              }
            }}
          />
        )}
      </Field>

      {needsManualConditions && (
        <fieldset className="mb-6 border border-rule bg-surface p-4">
          <legend className="px-1 font-sans text-label uppercase text-muted">
            We don't know {destination.trim()}
          </legend>
          <p className="measure mb-4 text-small text-muted">
            Tell us roughly what to expect and the list will still be built
            properly.
          </p>

          <Field label="How warm is it then?">
            {(props) => (
              <Select
                {...props}
                value={band}
                onChange={(e) => setBand(e.target.value as TempBand)}
              >
                {(Object.keys(BAND_LABEL) as TempBand[]).map((b) => (
                  <option key={b} value={b}>
                    {BAND_LABEL[b]}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="And the rain?">
            {(props) => (
              <Select
                {...props}
                value={wetness}
                onChange={(e) => setWetness(e.target.value as Wetness)}
              >
                {(Object.keys(WETNESS_LABEL) as Wetness[]).map((w) => (
                  <option key={w} value={w}>
                    {WETNESS_LABEL[w]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </fieldset>
      )}

      {/* What the form is about to do, before it does it. */}
      {preview && (
        <div className="mb-6 border-t-2 border-ink pt-3">
          <Label>This builds</Label>
          <p className="measure mt-1 text-body text-ink">
            <strong>{preview.days} days</strong>
            {climate ? ` in ${climate.city}` : ""} ·{" "}
            {describeConditions(preview.conditions)}
          </p>
          <p className="mt-1 text-small text-muted">
            About {preview.count} items
            {climate
              ? `, based on ${MONTHS[monthsSpanned(startDate, endDate)[0]]} there.`
              : "."}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" variant="primary">
          Build the list
        </Button>
        <Button variant="quiet" onClick={() => router.push("/trips")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
