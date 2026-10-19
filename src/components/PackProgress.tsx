/**
 * A segmented tally — one cell per item, inked in as it's packed.
 *
 * A rounded progress bar would be the obvious thing and the wrong thing: the
 * design system puts the radius at zero and the mood at "printed, unhurried".
 * Counting cells also tells you how much is left at a glance, which a
 * percentage bar hides.
 */

export function PackProgress({
  packed,
  total,
  className = "",
}: {
  packed: number;
  total: number;
  className?: string;
}) {
  if (total === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={packed}
      aria-valuetext={`${packed} of ${total} packed`}
      className={`flex gap-[3px] ${className}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-3 flex-1 border ${
            i < packed ? "border-ink bg-ink" : "border-rule-strong bg-surface"
          }`}
        />
      ))}
    </div>
  );
}

/** "11 of 24 packed" — the number beside the tally. */
export function PackCount({
  packed,
  total,
  className = "",
}: {
  packed: number;
  total: number;
  className?: string;
}) {
  return (
    <span className={`font-sans text-label uppercase text-muted ${className}`}>
      {packed} / {total}
    </span>
  );
}
