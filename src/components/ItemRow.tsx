"use client";

import { Checkbox } from "./Field";
import type { Item } from "@/lib/types";

/**
 * One line of the manifest: a square checkbox, the label, a quantity stepper
 * when there's more than one, the reason it's on the list, and a way to remove it.
 *
 * The reason is the point. A list that silently decides you need a rain shell is
 * a list you don't trust; "march in lisbon" is the difference between a
 * suggestion and an instruction.
 */

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
  const stepper = item.qty > 1 || item.source === "duration";

  return (
    <li className="group flex items-center gap-3 border-b border-rule py-2 last:border-b-0">
      <Checkbox
        id={`item-${item.id}`}
        checked={item.packed}
        onChange={onToggle}
      />

      <label
        htmlFor={`item-${item.id}`}
        className={`flex-1 cursor-pointer text-body ${
          item.packed ? "text-muted line-through decoration-rule-strong" : "text-ink"
        }`}
      >
        {item.label}
      </label>

      {stepper && (
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onQty(item.qty - 1)}
            disabled={item.qty <= 1}
            aria-label={`One fewer ${item.label.toLowerCase()}`}
            className="size-6 border border-rule-strong bg-surface text-small leading-none text-ink hover:bg-surface-raised disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-6 text-center font-sans text-small tabular-nums text-ink">
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
      )}

      {reason && (
        <span className="hidden text-small text-muted sm:inline">· {reason}</span>
      )}

      {/* Visible on hover and whenever it has keyboard focus, so it's reachable
          without a pointer. */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.label.toLowerCase()} from this list`}
        className="text-small text-muted opacity-0 transition-opacity hover:text-error focus-visible:opacity-100 group-hover:opacity-100"
      >
        Remove
      </button>
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
      return `${context.month.toLowerCase()} in ${context.destination.toLowerCase()}`;
    case "duration":
      return `${context.days} days`;
    case "learned":
      return "you added this last time";
    case "manual":
      return "you added this";
    case "essential":
      return "";
  }
}
