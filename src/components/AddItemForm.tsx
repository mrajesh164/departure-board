"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Field, Select, TextInput } from "./Field";
import { Label } from "./Card";
import { Chip } from "./Controls";
import { styleFor } from "./categoryStyle";
import type { Item, ItemCategory } from "@/lib/types";
import { CATEGORY_ORDER } from "@/lib/types";

/**
 * Add something the list didn't think of — either by typing it, or by picking
 * from the inventory you already keep.
 *
 * The inventory picker matters more than it looks: without it, Inventory is a
 * read-only report, and the things you own have no way of reaching the trip
 * you're packing for. With it, the two halves of the app actually connect.
 *
 * Two error states, both beside the field and both phrased as what to do next.
 * On a failed submit the typed value stays put — the whole point is that you
 * don't retype anything.
 */

const NEW_CATEGORY = "__new__";

export type InventoryOption = { label: string; category: ItemCategory };

export function AddItemForm({
  existingLabels,
  existingCategories,
  inventoryOptions = [],
  onAdd,
}: {
  existingLabels: string[];
  /** Custom categories already on this trip, so they can be reused. */
  existingCategories?: ItemCategory[];
  /** Things in your inventory that aren't on this list yet. */
  inventoryOptions?: InventoryOption[];
  onAdd: (item: Item) => void;
}) {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<string>("Extras");
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState<string>();
  const [categoryError, setCategoryError] = useState<string>();
  const [justAdded, setJustAdded] = useState<string>();
  const [browsing, setBrowsing] = useState(false);

  const extras = (existingCategories ?? []).filter(
    (c) => !CATEGORY_ORDER.includes(c),
  );
  const choosingNew = category === NEW_CATEGORY;

  function add(itemLabel: string, itemCategory: ItemCategory) {
    onAdd({
      id: crypto.randomUUID(),
      label: itemLabel,
      qty: 1,
      category: itemCategory,
      source: "manual",
      packed: false,
    });
    setJustAdded(itemLabel);
  }

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

    add(trimmed, resolved);
    setLabel("");
    setError(undefined);
    setCategoryError(undefined);
    // Keep the new category selected so several things can go into it in a row.
    if (choosingNew) {
      setCategory(resolved);
      setCustomCategory("");
    }
  }

  return (
    <div>
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
      </form>

      {/* Confirmation, announced politely rather than interrupting. */}
      <p aria-live="polite" className="text-small text-success">
        {justAdded ? `Added ${justAdded}. It'll be here next time too.` : ""}
      </p>

      {inventoryOptions.length > 0 && (
        <div className="mt-2">
          <Button
            variant="quiet"
            aria-expanded={browsing}
            onClick={() => setBrowsing((b) => !b)}
          >
            {browsing
              ? "Hide your inventory"
              : `Or choose from your inventory (${inventoryOptions.length})`}
          </Button>

          {browsing && (
            <div className="mt-3 border border-rule bg-surface p-3">
              <Label>Not on this list yet</Label>
              <ul className="mt-2 flex max-h-56 flex-wrap gap-2 overflow-y-auto">
                {inventoryOptions.map((option) => {
                  const style = styleFor(option.category);
                  return (
                    <li key={option.label}>
                      <Chip
                        swatch={style.hue}
                        onClick={() => add(option.label, option.category)}
                        label={`Add ${option.label.toLowerCase()} to this list`}
                      >
                        {option.label}
                      </Chip>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
