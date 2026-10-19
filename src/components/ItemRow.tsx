"use client";

import { Checkbox } from "./Field";
import type { Item } from "@/lib/types";

/**
 * One line of the manifest: a square checkbox, the label, a quantity stepper
 * and a way to remove it.
 *
 * Laid out as a grid rather than a flex row so the columns line up down the
 * page. Every row reserves the quantity slot even when there's nothing to
 * count, so the steppers don't stagger.
 *
 * Rows used to carry a per-item reason ("November in Atlanta"). It repeated on
 * every climate-driven line and said nothing the header didn't already say
 * better — the trip header states the month and the conditions once, which is
 * where that belongs.
 */

/**
 * Remove sits *left* of the quantity so the steppers land flush against the
 * right edge. Both slots keep their width whether or not they're in use, so
 * nothing shifts when Remove fades in on hover or when a row has nothing to
 * count.
 */
const GRID =
  "grid items-center gap-x-3 border-b border-rule py-2 last:border-b-0 " +
  "grid-cols-[18px_minmax(0,1fr)_auto] " +
  "sm:grid-cols-[18px_minmax(0,1fr)_72px_92px]";

export function ItemRow({
  item,
  onToggle,
  onQty,
  onRemove,
}: {
  item: Item;
  onToggle: () => void;
  onQty: (qty: number) => void;
  onRemove: () => void;
}) {
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
      {/* Every item counts. A toothbrush is usually one, but someone packing for
          two people needs two, and there's no reason this should be the one row
          you can't adjust. */}
      <span className="flex items-center justify-end gap-1 sm:justify-self-end">
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
      </span>
    </li>
  );
}
