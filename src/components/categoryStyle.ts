import type { ItemCategory, KnownCategory } from "@/lib/types";

/**
 * A colour per packing category.
 *
 * Café Terrace reserves the accent (#AE3220) for the primary action alone, so
 * none of these come near it. They're pigments rather than UI colours — slate,
 * rust, olive, leather, pine, graphite, ochre — the kind of limited ink set a
 * printed chart would actually have used. Enough to tell the sections apart at
 * a glance on a long list, not enough to turn the page into a fruit salad.
 *
 * `hue` is for rules and markers; `tint` is a wash for section headers.
 */

export type CategoryStyle = { hue: string; tint: string };

const KNOWN: Record<KnownCategory, CategoryStyle> = {
  Documents: { hue: "#3E5668", tint: "#DDE3E8" },
  Outerwear: { hue: "#7B3F2E", tint: "#EBDCD5" },
  Clothing: { hue: "#5F7048", tint: "#E1E6D7" },
  Footwear: { hue: "#6B4E32", tint: "#E7DED2" },
  Toiletries: { hue: "#3A6560", tint: "#D9E4E2" },
  Tech: { hue: "#4A4A58", tint: "#DFDFE4" },
  Extras: { hue: "#7A5E16", tint: "#ECE3CC" },
};

/**
 * Spare pigments for categories people invent. Same restraint as the set above,
 * and picked deterministically from the name so a given category always draws
 * the same colour.
 */
const SPARE: CategoryStyle[] = [
  { hue: "#5B4A6B", tint: "#E3DDE9" },
  { hue: "#2F5B4A", tint: "#D8E5DF" },
  { hue: "#71553F", tint: "#E9E0D6" },
  { hue: "#45566B", tint: "#DCE1E8" },
  { hue: "#6B5420", tint: "#EAE2CE" },
];

export function styleFor(category: ItemCategory): CategoryStyle {
  const known = KNOWN[category as KnownCategory];
  if (known) return known;

  let h = 0;
  for (let i = 0; i < category.length; i++) {
    h = (h * 31 + category.charCodeAt(i)) >>> 0;
  }
  return SPARE[h % SPARE.length];
}

/** Kept for the known set where an exhaustive map is genuinely wanted. */
export const CATEGORY_STYLE = KNOWN;
