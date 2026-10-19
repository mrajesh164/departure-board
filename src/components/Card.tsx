/** Flat plates with a hard 1px rule. No rounded corners, no blur. */

export function Card({
  className = "",
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "li" | "section" | "article";
}) {
  return (
    <Tag className={`border border-rule bg-surface p-5 ${className}`}>
      {children}
    </Tag>
  );
}

/** Status only, never clickable. */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning";
}) {
  const tones = {
    neutral: "border-rule-strong text-muted",
    accent: "border-accent text-accent",
    success: "border-success text-success",
    warning: "border-warning text-warning",
  };
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-sans text-label uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** The small uppercase caption that titles a block. */
export function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`font-sans text-label uppercase text-muted ${className}`}>
      {children}
    </p>
  );
}

/** 2px rule for section separators. */
export function SectionRule({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t-2 border-ink/80 ${className}`} />;
}
