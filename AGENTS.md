<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# The Departure Board

A packing list for trips you take again. You keep a few recurring trips on a board
— "Thanksgiving at my parents'", "Ann Arbor for a game weekend", "Lisbon in March"
— and each time one comes around, the list is already built, already corrected by
the last time you took it, and already adjusted for how long you're going and what
the weather does there that month.

Course: Design, Build, Ship · MPCS 51238 · Assignment 3 (Patterns & Flows).
Due Tuesday, October 20 2026, 5:30 PM.

## The three flows

The assignment is organized around three flows. Every design decision should serve one.

**1. First visit** — nothing in storage. The board is empty, so instead of an empty
screen it offers three ready-made trips to adopt ("A weekend at home", "A week
somewhere warm", "Three days for a conference"). One tap puts a real trip on the
board with a real packing list. The person learns what the tool is by using it, not
by reading a tour.

**2. The core task** — written as one sentence:

> I add a trip → the board builds its packing list from the dates and the destination → I check things off as I pack → I come back next time and it's already corrected from last trip.

**3. Coming back** — two reasons, kept deliberately simple:
- *Before the trip:* the board leads with the next departure and what's still unpacked ("Lisbon, in 3 days — 7 items left").
- *After the trip:* a short review marks what you never used and what you wished
  you'd brought. Those corrections are applied the next time you pack that trip.
  The list measurably improves each time you return.

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
   and the provider's `useState` lazy initializer reads the *same* key so React's
   initial state agrees with the DOM. Keep those two in sync — if you change the
   storage key, change it in both places.

Generated route types are real: use `LayoutProps<"/">` and `PageProps<"/trips/[id]">`
rather than hand-writing props.

## Design system — Café Terrace

Carried over from Assignment 2 (https://design-hw2.vercel.app/design-systems/a).
The mood: *parchment and pressed ink under a red awning. Printed, unhurried, worn at
the corners.* It should read like a typeset document, not a web app — which suits a
departure board and a packing manifest.

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
| `rule-strong` | `#90867C` | input and control edges |
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
- Shared components used consistently — `Button`, `Field`, `TextInput`, `Card`.
  Don't style a one-off button inline.
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
