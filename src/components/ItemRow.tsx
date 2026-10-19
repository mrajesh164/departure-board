"use client";

import { Checkbox } from "./Field";
import type { Item } from "@/lib/types";

/**
 * One line of the manifest: a square checkbox, the label, a quantity stepper,
 * the reason it's on the list, and a way to remove it.
 *
 * Laid out as a grid rather than a flex row so the columns actually line up
 * down the page. Every row reserves the quantity slot even when there's nothing
 * to count — otherwise the reasons stagger left and right depending on whether
 * the row above had a stepper, which is what made the list look untidy.
 *
 * The reason is the point. A list that silently decides you need a rain shell
 * is a list you don't trust; "November in Minneapolis" is the difference
 * between a suggestion and an instruction.
 */

const GRID =
  "grid items-center gap-x-3 border-b border-rule py-2 last:border-b-0 " +
  "grid-cols-[18px_minmax(0,1fr)_auto] " +
  "sm:grid-cols-[18px_minmax(0,1fr)_84px_180px_72px]";

export function ItemRow({
  item,
  reason,
  onToggle,
  onQty,
  onRemove,
}: {
  item: Item;
  reason: string;
  onToggle: () => void;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
  const countable = item.qty > 1 || item.source === "duration";

  return (
    <li className={`group ${GRID}`}>
      <Checkbox
        id={`item-${item.id}`}
        checked={item.packed}
        onChange={onToggle}
      />

      <label
        htmlFor={`item-${item.id}`}
        className={`cursor-pointer text-body ${
          item.packed
            ? "text-muted line-through decoration-rule-strong"
            : "text-ink"
        }`}
      >
        {item.label}
      </label>

      {/* Reserved whether or not this row counts, to hold the column. */}
      <span className="flex items-center justify-end gap-1">
        {countable && (
          <>
            <button
              type="button"
              onClick={() => onQty(item.qty - 1)}
              disabled={item.qty <= 1}
              aria-label={`One fewer ${item.label.toLowerCase()}`}
              className="size-6 border border-rule-strong bg-surface text-small leading-none text-ink hover:bg-surface-raised disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-5 text-center font-sans text-small tabular-nums text-ink">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => onQty(item.qty + 1)}
              aria-label={`One more ${item.label.toLowerCase()}`}
              className="size-6 border border-rule-strong bg-surface text-small leading-none text-ink hover:bg-surface-raised"
            >
              +
            </button>
          </>
        )}
      </span>

      <span className="hidden truncate text-small text-muted sm:block">
        {reason}
      </span>

      {/* Visible on hover, and whenever it has keyboard focus so it's reachable
          without a pointer. */}
      <span className="hidden justify-self-end sm:block">
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.label.toLowerCase()} from this list`}
          className="text-small text-muted opacity-0 transition-opacity hover:text-error focus-visible:opacity-100 group-hover:opacity-100"
        >
          Remove
        </button>
      </span>
    </li>
  );
}

/**
 * Why an item is on the list, in plain English. `essential` returns nothing —
 * a toothbrush needs no justification, and annotating it would be noise.
 */
export function reasonFor(
  item: Item,
  context: { month: string; destination: string; days: number },
): string {
  switch (item.source) {
    case "climate":
      return `${context.month} in ${context.destination}`;
    case "duration":
      return `${context.days} days`;
    case "learned":
      return "You added this last time";
    case "manual":
      return "You added this";
    case "essential":
      return "";
  }
}
