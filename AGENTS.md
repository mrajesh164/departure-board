<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Wanderlist

Packing lists for your favorite destinations. You keep the trips you take again in one place
— "Thanksgiving at my parents'", "Ann Arbor for a game weekend", "Lisbon in March"
— and each time one comes around, the list is already built, already corrected by
the last time you took it, and already adjusted for how long you're going and what
the weather does there that month.

Course: Design, Build, Ship · MPCS 51238 · Assignment 3 (Patterns & Flows).
Due Tuesday, October 20 2026, 5:30 PM.

## The three flows

The assignment is organized around three flows. Every design decision should serve one.

**1. First visit** — nothing in storage. There is nothing to show, so instead of an empty
screen it offers three ready-made trips to adopt ("A weekend at home", "A week
somewhere warm", "Three days for a conference"). One tap produces a real trip with a real
packing list. The person learns what the tool is by using it, not
by reading a tour.

**2. The core task** — written as one sentence:

> I add a trip → it builds a packing list from the dates and the destination → I check things off as I pack → I come back next time and it's already corrected from last trip.

**3. Coming back** — three reasons, on three clocks:
- *Mid-pack:* packing happens over several evenings, so a part-packed list is a
  standing invitation to come back and finish it.
- *Before the trip:* home and Upcoming both lead with the next departure and what's still unpacked ("Lisbon, in 3 days — 7 items left").
- *After the trip:* a short review marks what you never used and what you wished
  you'd brought. Those corrections are applied the next time you pack that trip.
  The list measurably improves each time you return.

## Shape of the app

Four tabs in the masthead, which is what gives the tool a legible purpose. New trip leads
because starting one is what people arrive to do; the rest are views onto trips that
already exist.

| Tab | Route | What it is |
|---|---|---|
| — | `/` | Home, with two faces. **A true first visit lands here and the onboarding *is* this page** — three ready-made trips or your own, one tap to a real list. Returning, it says "Welcome Back" and leads with the next departure. |
| New trip | `/trips/new` | The form. Also serves `?from=<id>` to repeat a finished trip with its corrections applied. |
| Upcoming | `/trips` | Upcoming trips only, soonest first. Starters on a true first visit. |
| Previous | `/previous` | Finished trips: what was packed, what each taught the next list, and "Pack this again". Lives at `/previous`, not `/trips/previous`, so it can't collide with a trip id. |
| Inventory | `/inventory` | Things you list yourself (`kit` in storage) merged with everything trips reveal. Every row carries a quantity and a stepper to set it. Sorts by Packed most, or filters to Never used. Also lists what you took per finished trip. |

A trip (`/trips/[id]`) and its review belong to the Upcoming tab, since that's
where you came from.

**The first visit lives in `components/StarterTrips.tsx`**, rendered by both `/`
and `/trips` so neither entry point can dead-end. It carries
`components/WorkedExample.tsx` — a trip already packed twice, with its
corrections shown inline. That exists because the correction loop is the only
thing this tool does that a notes app doesn't, and it's the one thing a first
visit can't otherwise show: it takes two trips to happen. The example is built
by `lib/example.ts`, flagged `isExample`, badged wherever it appears, and
deletable like any other trip. The `data-when` CSS gate (see
`globals.css`) now applies to home. `components/ResetFirstVisit.tsx` in the
footer exists because otherwise the onboarding becomes unreachable the moment it
succeeds — there's no other way to see it again on the same device.

**Adding an item does three things at once** (`addItem` in `providers.tsx`): it
joins the trip, joins `learned.add` so the next run of that trip starts with it,
and joins your inventory. If you packed it, you own it. The add form can also
pull straight *from* the inventory, which is what keeps that page from being a
read-only report.

**Inventory is mostly derived.** `src/lib/inventory.ts` aggregates `trip.items`
plus `trip.learned` across all trips, then merges in `state.kit` — the things
someone listed directly. Keep that split: trips remain the source of truth for
what has been *packed*, and `kit` only adds what hasn't been packed yet.

**Every inventory row has a quantity, and they're not equally trustworthy.**
`KitEntry.qtySource` says which kind a number is, and `resolveQty` picks it in
this order:

| Source | Where the number comes from | Trust |
| --- | --- | --- |
| `counted` | `KitItem.qty` — the stepper, an `x3` suffix, or the 1 a form add starts at | True |
| `inferred` | `packedMax`, the most ever ticked off a list at once | A floor |
| `assumed` | `1`, because it's been on a list but never ticked | None |

**The number is `max(counted, packedMax)`.** You cannot own fewer of something
than you have packed at once, so evidence raises a claim and never the reverse.
This is what makes a default of 1 safe: accept the 1 on "Socks", tick
"Socks × 6" off a list, and the row reads 6 rather than holding a stale number.
Storage still says 1 — the max is computed on read, so nothing is rewritten
behind the user's back.

**`KitItem.qty` is optional, and the two cases are not the same claim:**

- Added through the **inventory form** → a real `1`. They saw that number and
  let it stand, so it counts and it may warn.
- Added as a **side effect of packing** (`addItem`, "if you packed it, you own
  it") → left undefined. Nobody was shown a quantity to accept. Don't "fix"
  this to 1; it would turn a side effect into a claim and warn on rows the
  person never counted.

Two more things depend on the distinction:

- `setKitQty` **creates** the `KitItem` when a label only exists as a derived
  row. Nudging a stepper is the whole "this is mine" flow; there is no separate
  claim step.
- `shortfall()` ignores `assumed` numbers. Everything uncounted sits at 1, so
  without that guard a new person's first trip would warn on every row that
  asks for more than one. Only `counted` and `inferred` may speak.

The inventory stepper's `min` is `packedMax`, so it can't be set below the
floor — `resolveQty` would only put it back, which reads as a bug.

Listing something already in the inventory **adds up** rather than erroring — to
the count given, or one more than the row shows. The old "already in your
inventory" error was the wrong answer to a reasonable request (see the Assignment
3 feedback: owning two t-shirts was unsayable).

**Categories are open.** `ItemCategory` is a plain `string`; `KNOWN_CATEGORIES`
holds the seven defaults and `categoriesPresent()` orders known-then-custom. Use
`styleFor(category)` from `components/categoryStyle.ts` rather than indexing the
map, so an invented category still gets a colour.

## Pictures

`src/lib/photos.ts` holds one Wikimedia CDN thumbnail per destination slug. Those
URLs were resolved once by hand from Wikipedia's page-summary endpoint and each
verified to return 200; **the running app never calls an API**. Requesting widths
above the stored thumbnail returns 400, so don't rewrite the `NNNpx-` segment.

`DestinationArt` falls back to a generated SVG poster when there's no photo for a
destination, or when the image fails to load. The poster is drawn *from the
climate data* — sun height, palette and rain density all come from the month's
conditions — so an unknown destination still gets a picture that means something.

## Hard constraints

These come from the assignment brief. Do not violate them, and push back if asked to.

- **No external APIs.** None. Weather is a hardcoded climate table in
  `src/lib/climate.ts`, not a fetch. There is no network call anywhere in this app.
- **No database, no backend, no accounts, no auth.** All state is `localStorage`.
- **No new packages** without asking first. Next.js + Tailwind is the whole stack.
  No state library, no form library, no date library, no UI kit, no icon package.
- Deployed on Vercel's free Hobby plan.
- `AGENTS.md` (this file) is the context file. There must be no `CLAUDE.md`.

## Stack notes that actually bite

Next.js 16.4.2, React 19.3, Tailwind v4. Three things differ from older training data:

1. **`cacheComponents: true`** is on in `next.config.ts`. Next uses React
   `<Activity>` to keep recently visited routes *mounted* (hidden) across client-side
   navigation. Per-route component state is therefore preserved, not torn down.
   **Consequence:** never let two routes each hold their own copy of the trips state —
   one will go stale. All trip state lives in a single provider in the root layout
   (`src/app/providers.tsx`), and every route reads it through the `useTrips()` hook.

2. **Tailwind v4 has no `tailwind.config.js`.** Design tokens are declared in
   `src/app/globals.css` with `@theme`. Add a color there and it becomes a utility
   (`--color-accent` → `bg-accent`, `text-accent`).

3. **Reading `localStorage` naively causes a hydration mismatch or a flash.** A
   returning user must never see the first-visit screen flicker past. The fix, from
   `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`:
   an inline script in `<head>` sets `data-has-trips` on `<html>` during HTML parsing,
   and the provider reads the *same* key so React's initial state agrees with the
   DOM. Keep those two in sync — if you change the storage key, change it in both
   places.

   Keys are `wanderlist.*`. Each falls back to a `departure-board.*` predecessor
   from before the rename and writes forward on first read, so nobody's saved
   trips were orphaned — `LEGACY_STORAGE_KEY` in `lib/storage.ts`. The inline
   script checks both names for the same reason.

4. **Hand-written CSS must go in `@layer base`.** Tailwind v4 emits utilities
   inside a cascade layer, and unlayered rules beat layered ones regardless of
   specificity. A bare `a { text-decoration: underline }` in `globals.css`
   therefore won against `no-underline` on *every* link, underlining the text
   inside every button-styled link. Element defaults belong in `@layer base`;
   only classes that must win (`.checkbox`, the `[data-when]` gate) stay
   unlayered.

5. **Tailwind arbitrary values can't hold an inline SVG data URI.** The checkbox
   tick was written as `bg-[url('data:image/svg+xml;utf8,<svg …>')]` and silently
   compiled to `background-image: none` — the angle brackets, hash and spaces
   don't survive. It lives in `globals.css` as `.checkbox:checked` instead. Note
   also that editing `globals.css` reliably needs a dev-server restart before
   Turbopack serves the change — budget for it rather than debugging a ghost.

Generated route types are real: use `LayoutProps<"/">` and `PageProps<"/trips/[id]">`
rather than hand-writing props.

## Design system — Café Terrace

Carried over from Assignment 2 (https://design-hw2.vercel.app/design-systems/a).
The mood: *parchment and pressed ink under a red awning. Printed, unhurried, worn at
the corners.* It should read like a typeset document, not a web app — which suits a
a departure board and a packing manifest.

Colors, declared as tokens in `globals.css`:

| Token | Hex | Use |
|---|---|---|
| `background` | `#E8DCC5` | the page |
| `surface` | `#F6EFE3` | cards, inputs, panels |
| `surface-raised` | `#EAE2D7` | hover fill on quiet controls |
| `selected` | `#EDD8CC` | chosen rows and chips |
| `ink` | `#2B1D16` | headings and body |
| `muted` | `#685C54` | captions, meta, placeholders |
| `rule` | `#C3BAB0` | dividers and plate rules |
| `rule-strong` | `#83796F` | input and control edges (darkened from `#90867C` to clear 3:1 against the page) |
| `accent` | `#AE3220` | primary action only |
| `success` | `#41662F` | confirmation |
| `error` | `#7B1E2B` | failure and destructive |
| `warning` | `#7A4F10` | caution |

Type: **Fraunces** for display and headings, **Source Sans 3** for body and labels.
Display 56/52 w600 `-0.02em`; Heading 28/34 w600; Body 16/26 w400 (max 68 characters
per line); Label 11/16 w600 uppercase `0.14em`.

Shape and rules — these are what make it look printed, so hold the line:
- **Border radius is 0.** Controls may use 2px. Nothing rounder is permitted.
- Shadows are hard-offset with **no blur** (`none`, `raised`, `lifted`).
- 1px hairline dividers, 1px strong on control edges, 2px section rules, 3px accent
  rule on a selected tab.
- Focus outline 2px, offset 2px — tomato on quiet controls, espresso on accent fill.
- Spacing is a 4px scale: 4, 8, 12, 16, 24, 32, 48, 64.

**Category colours** live in `src/components/categoryStyle.ts` — one muted pigment
per packing category (slate, rust, olive, leather, pine, graphite, ochre). They're
there so a 24-item list can be scanned by section. None of them come near the
accent, which still belongs to the primary action alone.

Component rules: primary button is the only accent fill and shifts down 1px when
pressed; secondary never uses accent; links are always underlined. Checkbox is
square, radio is round. Badges are status only, never clickable. An error is a rule,
an icon and a tint — **never an accent-coloured button**.

## Requirements this app is graded on

Keep these true as the code changes:

- A page per flow step with shared navigation, and it's clear where you are.
- First visit gives something useful immediately; no dead-end empty screen.
- Forms: one column, a real `<label>` on every field, errors rendered **next to the
  field** and phrased as an instruction ("Enter a destination." not "Invalid input."),
  and **every value the person typed survives a failed submit**.
- Coming back: the app remembers, and the returning experience is designed, not
  incidental.
- Shared components used consistently — `Button`, `Field` (with `TextInput`,
  `Select`, `TextArea`, `Checkbox`), `Card`, and `Controls` (`Stepper`,
  `QuietAction`, `SegmentedControl`, `Chip`, `SuggestionList`). **Don't style a
  one-off control inline.** The check is a grep: `<button`, `<input`,
  `<textarea>` and `<select` should appear nowhere outside those three files.
- Accessibility: full keyboard operation, visible focus, real labels, errors
  associated with their field (`aria-describedby` + `role="alert"`), and text
  contrast checked.
- Simplicity: prefer removing a step, a field, or an interaction.

## Conventions

- `src/lib/` is pure logic with no React: `storage.ts`, `climate.ts`,
  `suggestions.ts`, `trips.ts`. Keep it testable by reading.
- `src/components/` is the shared component set.
- Dates are stored as `YYYY-MM-DD` strings, never `Date` objects, so what's in
  `localStorage` is readable and timezone-stable.
- IDs come from `crypto.randomUUID()`.
- Commit in small steps — the commit history is graded.
