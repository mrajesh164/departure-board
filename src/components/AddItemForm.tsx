"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Field, TextInput } from "./Field";
import type { Item, ItemCategory } from "@/lib/types";
import { CATEGORY_ORDER } from "@/lib/types";
import { Select } from "./Field";

/**
 * Add something the list didn't think of.
 *
 * Two error states, both beside the field and both phrased as what to do next.
 * On a failed submit the typed value stays put — the whole point is that you
 * don't retype anything.
 */

export function AddItemForm({
  existingLabels,
  onAdd,
}: {
  existingLabels: string[];
  onAdd: (item: Item) => void;
}) {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<ItemCategory>("Extras");
  const [error, setError] = useState<string>();
  const [justAdded, setJustAdded] = useState<string>();

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = label.trim();
    if (!trimmed) {
      setError("Name the item you want to add.");
      return;
    }
    if (existingLabels.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
      // Echo their own wording back rather than a generic "duplicate".
      setError(`${trimmed} is already on this list.`);
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      label: trimmed,
      qty: 1,
      category,
      source: "manual",
      packed: false,
    });

    setLabel("");
    setError(undefined);
    setJustAdded(trimmed);
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Field label="Add an item" error={error}>
            {(props) => (
              <TextInput
                {...props}
                value={label}
                placeholder="Laundry sheets"
                onChange={(e) => {
                  setLabel(e.target.value);
                  // Clear the error as soon as they start fixing it.
                  if (error) setError(undefined);
                  if (justAdded) setJustAdded(undefined);
                }}
              />
            )}
          </Field>
        </div>

        <div className="sm:w-48">
          <Field label="Where it goes" optional>
            {(props) => (
              <Select
                {...props}
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>

        <Button type="submit" variant="primary" className="sm:mt-[29px]">
          Add
        </Button>
      </div>

      {/* Confirmation, announced politely rather than interrupting. */}
      <p aria-live="polite" className="text-small text-success">
        {justAdded ? `Added ${justAdded.toLowerCase()}. It'll be here next time too.` : ""}
      </p>
    </form>
  );
}
