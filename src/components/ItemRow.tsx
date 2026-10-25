"use client";

import { Checkbox } from "./Field";
import { QuietAction, Stepper } from "./Controls";
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
  owned,
  onToggle,
  onQty,
  onRemove,
}: {
  item: Item;
  /**
   * How many you own, when the list asks for more than that and the number is
   * worth trusting. Undefined covers both "no shortfall" and "we're only
   * assuming one" — see `shortfall` in lib/inventory.ts, which is what decides.
   */
  owned?: number;
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

      <div className="min-w-0">
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

        {/* The list wants more of this than your inventory says you have, which
            is a laundry problem worth knowing about before you're standing at
            the suitcase. It sits outside the <label> so reading it doesn't tick
            the box. */}
        {owned !== undefined && !item.packed && (
          <span className="block text-small text-warning">
            You own {owned}
          </span>
        )}
      </div>

      <span className="hidden justify-self-end sm:block">
        <QuietAction
          onClick={onRemove}
          label={`Remove ${item.label.toLowerCase()} from this list`}
        >
          Remove
        </QuietAction>
      </span>

      {/* Every item counts. A toothbrush is usually one, but someone packing for
          two people needs two, and there's no reason this should be the one row
          you can't adjust. */}
      <span className="flex justify-end sm:justify-self-end">
        <Stepper
          value={item.qty}
          onChange={onQty}
          noun={item.label.toLowerCase()}
        />
      </span>
    </li>
  );
}
