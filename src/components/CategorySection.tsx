"use client";

import { ItemRow, reasonFor } from "./ItemRow";
import { PackCount } from "./PackProgress";
import type { Item, ItemCategory } from "@/lib/types";

/**
 * One category of the manifest, with its own tally.
 *
 * Per-section counts matter more than they look: "Outerwear 0 / 2" tells you
 * the coat is still in the wardrobe, which a single overall percentage buries.
 */

export function CategorySection({
  category,
  items,
  context,
  onToggle,
  onQty,
  onRemove,
}: {
  category: ItemCategory;
  items: Item[];
  context: { month: string; destination: string; days: number };
  onToggle: (itemId: string) => void;
  onQty: (itemId: string, qty: number) => void;
  onRemove: (itemId: string) => void;
}) {
  if (items.length === 0) return null;

  const packed = items.filter((i) => i.packed).length;

  return (
    <section className="mb-7">
      <div className="mb-1 flex items-baseline justify-between border-b border-rule-strong pb-1">
        <h3 className="font-sans text-label uppercase text-ink">{category}</h3>
        <PackCount packed={packed} total={items.length} />
      </div>

      <ul>
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            reason={reasonFor(item, context)}
            onToggle={() => onToggle(item.id)}
            onQty={(qty) => onQty(item.id, qty)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </ul>
    </section>
  );
}
