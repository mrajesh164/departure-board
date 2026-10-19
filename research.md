# How similar tools onboard people

Three comparable tools, studied by subagents working in parallel. Each was asked the same
things: what the very first screen shows, what it demands before you see anything useful,
how many steps until real value, and whether it uses defaults, samples, or a blank slate.

Sources were fetched rather than recalled, and each agent flagged what it couldn't verify.
Those gaps are kept below, because a couple of them matter.

| | **PackPoint** | **Todoist** | **TripIt** |
|---|---|---|---|
| Closest to | the packing engine | the reusable checklist | the trip board |
| First screen | asks your gender, then drops you in trip creation | signup → theme → dashboard | empty trip list + a corner `+` |
| Before any value | 6–8 inputs across ~4 screens | email and a theme | account **and** email verification |
| Cold start | none — no list without creating a trip | ghost placeholder text in the task field | none — no demo trip, no sample |
| Reuse | custom lists are Premium | templates are a one-shot copy | **no duplicate action at all** |
| Learns from use | no | no | no |

## What I took

**1 · Starter trips, not an empty board.** All three handle the cold start badly, and one
of them says so out loud: Doist's own onboarding deck states the lesson as *"Don't let your
users start from a blank page."* PackPoint is worse than empty — two separate App Store
reviews report being trapped on the new-trip screen with "no way to get out of that screen
without quitting." TripIt shows an empty list and a floating `+`; a public redesign case
study proposes "a big CTA to help the users to create the first trip" precisely because the
shipped one wasn't enough.

So the first visit offers three ready-made trips and builds a real list in one tap. No
fields, no gender question, no account, and no way to get stuck.

**2 · Label where the weather came from.** PackPoint fetches a live forecast and quietly
falls back to climate averages when it can't get one — and its v2.0 release notes say the
weather cards had to start *labelling* which of the two you were looking at. That's the
whole lesson. A list that mixes "it will rain Tuesday" with "it usually rains in March" is
a list you stop trusting.

This app only ever has climate normals, so it says so every time, on the trip itself:
a `Typical for November` badge and a line explaining it isn't a forecast. The assignment's
no-API constraint turned out to be the honest design rather than a limitation —
`src/components/ConditionsNote.tsx`.

**3 · "Pack this again" is a real button, on every past row.** This is the gap in all
three. TripIt stores years of trips and offers no way to act on one — an App Store reviewer
explicitly asks for it. Todoist has recurring *tasks* and reusable *templates* but never
joins them: its Travel Checklist template imports via CSV and its page never mentions reuse
or recurrence, and nothing anywhere marks what you didn't use.

None of them close the loop. So the loop is the product here, and it gets the weight of a
primary action rather than a link in a menu.

**4 · Let people change the dates.** A PackPoint reviewer: *"could not find anywhere to
change the dates other than re-doing it."* This app had the same hole. It now rebuilds the
list for new dates while keeping everything already checked off and everything added by
hand — `relist()` in `src/lib/trips.ts`.

**5 · Let people take their data out.** PackPoint reviewers report customised lists
disappearing after a reinstall, with no backup. A localStorage-only app is in a strictly
worse position: clearing site data is unrecoverable. Since the value of this tool *is* a
list corrected over several trips, losing it silently would be the worst possible failure —
hence export and restore on the board, validated through the app's own reader so a bad file
can't poison storage.

**6 · Concrete placeholders instead of a tour.** Todoist teaches its date syntax with ghost
text in the input ("Fix bike tire this weekend") and retires it after 15 completed tasks —
teaching at the moment of typing, with no modal. Every input here carries a real example
rather than a label repeated as a hint.

## What I deliberately didn't take

- **PackPoint's activities multi-select** (swimming, hiking, conference…) is genuinely
  high-signal, and the cheapest way to improve a list. It's the obvious next feature. It
  loses to simplicity for now: trip length and climate already carry most of the weight,
  and the brief rewards removing steps.
- **Todoist's calendar-anchored recurrence.** Its `every` vs `every!` distinction —
  repeat from the scheduled date versus from completion — clarified something. Trips
  aren't calendar events on a cycle; you repeat them when you repeat them. Reuse here is
  anchored to finishing a trip, not to a date.
- **Any form of import or email parsing.** TripIt's parser is reported wrong often enough
  that reviewers estimate "about 50% of the time", and forwarding from an unregistered
  address silently creates a second account — a real cold-start trap where your trip lands
  somewhere you can't see it. Never make import the only path; here it isn't a path at all.

## What couldn't be verified

TripIt's zero-trip screen isn't documented anywhere public, and the agent couldn't create
an account, so that row is inference from the help docs plus one critique — treat it as
the weakest claim here. Todoist's current dashboard may or may not still prefill example
tasks; sources from 2019 and 2023 disagree. PackPoint reviews span 2019–2025, so specifics
may be stale.
