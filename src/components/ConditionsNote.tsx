import { Badge } from "./Card";
import { describeConditions, type Conditions } from "@/lib/climate";

/**
 * What the weather is expected to do, and — just as importantly — where that
 * expectation came from.
 *
 * Researching comparable tools turned this into a deliberate decision rather
 * than an afterthought. PackPoint fetches a live forecast and silently falls
 * back to climate averages when one isn't available; its v2 release notes say
 * the cards had to start *labelling* which of the two you were looking at.
 * That's the whole lesson: a packing list that quietly mixes "it will rain on
 * Tuesday" with "it usually rains in March" is a list you stop trusting.
 *
 * This app only ever has the second kind, so it says so, every time. Being
 * explicit also turns the assignment's no-API constraint into something
 * honest — a repeat trip is usually planned past any forecast horizon anyway.
 */

export function ConditionsNote({
  conditions,
  month,
  destination,
  source,
}: {
  conditions: Conditions;
  month: string;
  destination: string;
  /** Where the numbers came from. */
  source: "climate" | "manual";
}) {
  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>
          {source === "climate" ? `Typical for ${month}` : "You told us"}
        </Badge>
        <span className="text-small text-ink">
          {describeConditions(conditions)}
        </span>
      </div>

      <p className="measure mt-1.5 text-small text-muted">
        {source === "climate" ? (
          <>
            Based on what {destination} usually does in {month.toLowerCase()} —
            not a forecast. Check one nearer the time.
          </>
        ) : (
          <>
            We don&apos;t have climate data for {destination}, so this list is
            built from the conditions you picked.
          </>
        )}
      </p>
    </div>
  );
}
