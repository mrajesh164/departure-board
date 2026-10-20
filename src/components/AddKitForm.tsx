"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Field, Select, TextArea, TextInput } from "./Field";
import { CATEGORY_ORDER, type ItemCategory } from "@/lib/types";

/**
 * Add things to your inventory, several at a time.
 *
 * Nobody lists what they own one field at a time — they think in runs ("rain
 * shell, hiking boots, head torch"). So this takes a whole list: one per line,
 * or separated by commas, which is also what you get when you paste from notes.
 *
 * The category select ends in "A new category…" so the seven defaults aren't a
 * ceiling.
 */

const NEW_CATEGORY = "__new__";

/** One per line, or comma separated, or both. */
function parseList(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function AddKitForm({
  existingLabels,
  existingCategories,
  onAdd,
}: {
  existingLabels: string[];
  existingCategories: ItemCategory[];
  onAdd: (labels: string[], category: string) => void;
}) {
  const [raw, setRaw] = useState("");
  const [category, setCategory] = useState<string>("Clothing");
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState<string>();
  const [categoryError, setCategoryError] = useState<string>();
  const [added, setAdded] = useState<string>();

  const extras = existingCategories.filter((c) => !CATEGORY_ORDER.includes(c));
  const choosingNew = category === NEW_CATEGORY;
  const parsed = parseList(raw);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (parsed.length === 0) {
      setError("List at least one thing to add.");
      return;
    }

    const known = new Set(existingLabels.map((l) => l.toLowerCase()));
    const fresh = parsed.filter((l) => !known.has(l.toLowerCase()));
    if (fresh.length === 0) {
      setError(
        parsed.length === 1
          ? `${parsed[0]} is already in your inventory.`
          : "Everything on that list is already in your inventory.",
      );
      return;
    }

    const resolved = choosingNew ? customCategory.trim() : category;
    if (choosingNew && !resolved) {
      setCategoryError("Name the new category.");
      return;
    }

    onAdd(fresh, resolved);
    setRaw("");
    setError(undefined);
    setCategoryError(undefined);
    setAdded(
      `Added ${fresh.length} to ${resolved}` +
        (fresh.length < parsed.length
          ? ` · ${parsed.length - fresh.length} already there`
          : ""),
    );
    if (choosingNew) {
      setCategory(resolved);
      setCustomCategory("");
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 border border-rule bg-surface p-5">
      <p className="measure mb-4 text-small text-muted">
        List what you own — one per line, or separated by commas. Things you
        pack on trips show up here automatically.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Field
            label="What do you have?"
            error={error}
          >
            {(props) => (
              <TextArea
                {...props}
                value={raw}
                rows={3}
                placeholder={"Rain shell\nHiking boots\nHead torch"}
                onChange={(e) => {
                  setRaw(e.target.value);
                  if (error) setError(undefined);
                  if (added) setAdded(undefined);
                }}
              />
            )}
          </Field>
        </div>

        <div className="sm:w-52">
          <Field label="Where it goes" error={categoryError}>
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
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary">
          {parsed.length > 1 ? `Add ${parsed.length} things` : "Add to inventory"}
        </Button>
        <p aria-live="polite" className="text-small text-success">
          {added ?? ""}
        </p>
      </div>
    </form>
  );
}
