import type { ItemCategory } from "@/lib/types";

/**
 * A colour per packing category.
 *
 * Café Terrace reserves the accent (#AE3220) for the primary action alone, so
 * none of these come near it. They're pigments rather than UI colours — slate,
 * rust, olive, leather, pine, graphite, ochre — the kind of limited ink set a
 * printed chart would actually have used. Enough to tell the sections apart at
 * a glance on a long list, not enough to turn the page into a fruit salad.
 *
 * `hue` is for rules and markers; `tint` is a wash for section headers. Both
 * are checked for contrast against the parchment background.
 */

export const CATEGORY_STYLE: Record<
  ItemCategory,
  { hue: string; tint: string }
> = {
  Documents: { hue: "#3E5668", tint: "#DDE3E8" },
  Outerwear: { hue: "#7B3F2E", tint: "#EBDCD5" },
  Clothing: { hue: "#5F7048", tint: "#E1E6D7" },
  Footwear: { hue: "#6B4E32", tint: "#E7DED2" },
  Toiletries: { hue: "#3A6560", tint: "#D9E4E2" },
  Tech: { hue: "#4A4A58", tint: "#DFDFE4" },
  Extras: { hue: "#7A5E16", tint: "#ECE3CC" },
};
