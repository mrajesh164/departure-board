"use client";

import { useRef, useState } from "react";
import { Button } from "./Button";
import { Field, Select, TextArea, TextInput, focusFirstError } from "./Field";
import { CATEGORY_ORDER, type ItemCategory } from "@/lib/types";
import type { KitAddition } from "@/app/providers";

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

/**
 * One per line, or comma separated, or both — with an optional count on the
 * end: "T-shirt x3", "Wool socks × 2".
 *
 * The count is a suffix rather than its own field on purpose. This textarea
 * exists so a list can be pasted straight out of notes, and a quantity input
 * beside it would break that in exchange for something the stepper on each row
 * already does better.
 */
function parseEntries(raw: string): KitAddition[] {
  return raw
    .split(/[\n,]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = /^(.*?)\s*[x×]\s*(\d{1,2})$/i.exec(part);
      if (!match || !match[1]) return { label: part };
      return { label: match[1].trim(), qty: Number(match[2]) };
    })
    .filter((entry) => entry.label.length > 0);
}

export function AddKitForm({
  existing,
  existingCategories,
  onAdd,
  onSetQty,
}: {
  /** Every row already in the inventory, with the count it currently shows. */
  existing: { label: string; qty: number; category: ItemCategory }[];
  existingCategories: ItemCategory[];
  onAdd: (entries: KitAddition[], category: string) => void;
  onSetQty: (label: string, category: ItemCategory, qty: number) => void;
}) {
  const [raw, setRaw] = useState("");
  const [category, setCategory] = useState<string>("Clothing");
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState<string>();
  const [categoryError, setCategoryError] = useState<string>();
  const [added, setAdded] = useState<string>();
  const formRef = useRef<HTMLFormElement>(null);

  const extras = existingCategories.filter((c) => !CATEGORY_ORDER.includes(c));
  const choosingNew = category === NEW_CATEGORY;
  const parsed = parseEntries(raw);

  function submit(event: React.FormEvent) {
    event.preventDefault();

    if (parsed.length === 0) {
      setError("List at least one thing to add.");
      queueMicrotask(() => focusFirstError(formRef.current));
      return;
    }

    const resolved = choosingNew ? customCategory.trim() : category;
    if (choosingNew && !resolved) {
      setCategoryError("Name the new category.");
      queueMicrotask(() => focusFirstError(formRef.current));
      return;
    }

    /**
     * Listing something twice used to be an error, which was the wrong answer
     * to the right question: someone typing "T-shirt" when a t-shirt is already
     * there is telling us they own another one. So a repeat adds up — to the
     * count they gave, or one more than the row shows.
     */
    const known = new Map(existing.map((e) => [e.label.toLowerCase(), e]));
    const fresh: KitAddition[] = [];
    const counted: string[] = [];

    for (const entry of parsed) {
      const current = known.get(entry.label.toLowerCase());
      if (!current) {
        fresh.push(entry);
        continue;
      }
      const next = entry.qty ?? current.qty + 1;
      if (next === current.qty) continue;
      /* Its own category, not whatever the select happens to be showing — this
         row already has a home and the add form isn't choosing it. */
      onSetQty(current.label, current.category, next);
      counted.push(`${current.label} → ${next}`);
    }

    if (fresh.length > 0) onAdd(fresh, resolved);

    setRaw("");
    setError(undefined);
    setCategoryError(undefined);

    const said = [
      fresh.length > 0 ? `Added ${fresh.length} to ${resolved}` : null,
      counted.length > 0 ? counted.join(", ") : null,
    ].filter(Boolean);
    setAdded(
      said.length > 0
        ? said.join(" · ")
        : "Already in your inventory at that count.",
    );
    if (choosingNew) {
      setCategory(resolved);
      setCustomCategory("");
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      className="mt-6 border border-rule bg-surface p-5"
    >
      <p className="measure mb-4 text-small text-muted">
        One per line, or separated by commas — add{" "}
        <span className="whitespace-nowrap">&ldquo;x2&rdquo;</span> for more than
        one. Things you pack show up here too.
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
                placeholder={"Rain shell\nHiking boots\nWool socks x2"}
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
