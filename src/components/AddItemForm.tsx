"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Field, Select, TextInput } from "./Field";
import type { Item, ItemCategory } from "@/lib/types";
import { CATEGORY_ORDER } from "@/lib/types";

/**
 * Add something the list didn't think of.
 *
 * Two error states, both beside the field and both phrased as what to do next.
 * On a failed submit the typed value stays put — the whole point is that you
 * don't retype anything.
 *
 * The category select ends in "A new category…", which reveals a text field.
 * Seven fixed sections cover most packing, but someone with climbing gear or a
 * baby shouldn't have to file it under Extras.
 */

const NEW_CATEGORY = "__new__";

export function AddItemForm({
  existingLabels,
  existingCategories,
  onAdd,
}: {
  existingLabels: string[];
  /** Custom categories already on this trip, so they can be reused. */
  existingCategories?: ItemCategory[];
  onAdd: (item: Item) => void;
}) {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<string>("Extras");
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState<string>();
  const [categoryError, setCategoryError] = useState<string>();
  const [justAdded, setJustAdded] = useState<string>();

  const extras = (existingCategories ?? []).filter(
    (c) => !CATEGORY_ORDER.includes(c),
  );
  const choosingNew = category === NEW_CATEGORY;

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

    const resolved = choosingNew ? customCategory.trim() : category;
    if (choosingNew && !resolved) {
      setCategoryError("Name the new category.");
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      label: trimmed,
      qty: 1,
      category: resolved,
      source: "manual",
      packed: false,
    });

    setLabel("");
    setError(undefined);
    setCategoryError(undefined);
    setJustAdded(trimmed);
    // Keep the new category selected so several things can go into it in a row.
    if (choosingNew) {
      setCategory(resolved);
      setCustomCategory("");
    }
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

        <div className="sm:w-52">
          <Field label="Where it goes" optional error={categoryError}>
            {(props) => (
              <>
                <Select
                  {...props}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (categoryError) setCategoryError(undefined);
                  }}
                >
                  {[...CATEGORY_ORDER, ...extras].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY}>A new category…</option>
                </Select>

                {choosingNew && (
                  <TextInput
                    value={customCategory}
                    autoFocus
                    aria-label="Name the new category"
                    placeholder="Climbing gear"
                    className="mt-2"
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      if (categoryError) setCategoryError(undefined);
                    }}
                  />
                )}
              </>
            )}
          </Field>
        </div>

        <Button type="submit" variant="primary" className="sm:mt-[29px]">
          Add
        </Button>
      </div>

      {/* Confirmation, announced politely rather than interrupting. */}
      <p aria-live="polite" className="text-small text-success">
        {justAdded ? `Added ${justAdded}. It'll be here next time too.` : ""}
      </p>
    </form>
  );
}
