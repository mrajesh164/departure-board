"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTrips } from "@/app/providers";
import { Button, ButtonLink } from "@/components/Button";
import { Label } from "@/components/Card";
import { Checkbox, Field, TextInput } from "@/components/Field";

/**
 * Two questions, asked once, after the trip.
 *
 * This is the long-cycle reason to come back, and the thing that makes a repeat
 * trip cheaper than a first one: what you mark here is written to trip.learned
 * and applied the next time you pack it.
 */

export default function ReviewPage() {
  return (
    <Suspense fallback={<div aria-hidden="true" className="h-64" />}>
      <Review />
    </Suspense>
  );
}

function Review() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { trips, ready, updateTrip } = useTrips();

  const trip = trips.find((t) => t.id === id);

  const [neverUsed, setNeverUsed] = useState<string[]>([]);
  const [wished, setWished] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();

  if (!ready) return <div aria-hidden="true" className="h-64" />;

  if (!trip) {
    return (
      <>
        <h1 className="font-display text-heading text-ink">
          That trip isn&apos;t here
        </h1>
        <ButtonLink href="/trips" className="mt-5">
          Back to the board
        </ButtonLink>
      </>
    );
  }

  function addWish(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Name the thing you wished you'd brought.");
      return;
    }
    if (wished.some((w) => w.toLowerCase() === trimmed.toLowerCase())) {
      setError(`${trimmed} is already on this list.`);
      return;
    }
    setWished((w) => [...w, trimmed]);
    setDraft("");
    setError(undefined);
  }

  function save() {
    updateTrip(trip!.id, (t) => ({
      ...t,
      completedAt: t.completedAt ?? new Date().toISOString(),
      review: {
        neverUsed,
        wishedFor: wished,
        reviewedAt: new Date().toISOString(),
      },
      learned: {
        // Never used → stop suggesting it. Wished for → start suggesting it.
        drop: [...new Set([...t.learned.drop, ...neverUsed])],
        add: [...new Set([...t.learned.add, ...wished])],
      },
    }));
    router.push("/trips");
  }

  const packedItems = trip.items.filter((i) => i.packed);
  const candidates = packedItems.length > 0 ? packedItems : trip.items;

  return (
    <>
      <Label>Back from {trip.destination}</Label>
      <h1 className="mt-1 font-display text-heading text-ink">{trip.name}</h1>
      <p className="measure mt-1 text-body text-muted">
        Two questions. Whatever you mark here is applied the next time you pack
        this trip, so the list gets closer to right each time.
      </p>

      {/* --- 1. what came home unused --- */}
      <section className="mt-8">
        <h2 className="font-display text-subhead text-ink">
          Did you carry anything you never touched?
        </h2>
        <p className="mt-1 text-small text-muted">
          These stop being suggested. You can always add them back.
        </p>

        <ul className="mt-3">
          {candidates.map((item) => {
            const checked = neverUsed.includes(item.label);
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 border-b border-rule py-2 last:border-b-0"
              >
                <Checkbox
                  id={`unused-${item.id}`}
                  checked={checked}
                  onChange={() =>
                    setNeverUsed((prev) =>
                      checked
                        ? prev.filter((l) => l !== item.label)
                        : [...prev, item.label],
                    )
                  }
                />
                <label
                  htmlFor={`unused-${item.id}`}
                  className={`flex-1 cursor-pointer text-body ${
                    checked ? "text-muted line-through decoration-rule-strong" : "text-ink"
                  }`}
                >
                  {item.label}
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {/* --- 2. what was missing --- */}
      <section className="mt-9">
        <h2 className="font-display text-subhead text-ink">
          Anything you wished you&apos;d brought?
        </h2>
        <p className="mt-1 text-small text-muted">
          These get added to the list next time, marked as yours.
        </p>

        {wished.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {wished.map((w) => (
              <li
                key={w}
                className="flex items-center gap-2 border border-rule-strong bg-selected px-2 py-1 text-small text-ink"
              >
                {w}
                <button
                  type="button"
                  aria-label={`Remove ${w.toLowerCase()}`}
                  onClick={() => setWished((prev) => prev.filter((x) => x !== w))}
                  className="text-muted hover:text-error"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addWish} noValidate className="mt-3 max-w-md">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <Field label="What was missing?" error={error}>
                {(props) => (
                  <TextInput
                    {...props}
                    value={draft}
                    placeholder="Laundry sheets"
                    onChange={(e) => {
                      setDraft(e.target.value);
                      if (error) setError(undefined);
                    }}
                  />
                )}
              </Field>
            </div>
            <Button type="submit" className="mt-[29px]">
              Add
            </Button>
          </div>
        </form>
      </section>

      <div className="mt-6 flex flex-wrap gap-3 border-t-2 border-ink pt-5">
        <Button variant="primary" onClick={save}>
          Save and finish
        </Button>
        <ButtonLink href="/trips" variant="quiet">
          Skip for now
        </ButtonLink>
      </div>
    </>
  );
}
