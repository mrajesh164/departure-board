import Link from "next/link";

/**
 * Café Terrace buttons.
 *
 * Rules from the design system, held to deliberately:
 * - the primary is the ONLY thing that may carry the accent fill
 * - a secondary never uses the accent
 * - pressing shifts the button down 1px, like a key on a typewriter
 * - 2px corner, never rounder
 */

type Variant = "primary" | "secondary" | "quiet" | "danger";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[2px] px-4 py-2 " +
  "font-sans text-small font-semibold transition-[translate,background-color] " +
  "active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 " +
  "disabled:active:translate-y-0";

const VARIANTS: Record<Variant, string> = {
  // The accent fill. Espresso focus ring so it stays visible against tomato.
  primary: "on-accent bg-accent text-surface hover:bg-[#95291a] shadow-raised",
  secondary:
    "border border-rule-strong bg-surface text-ink hover:bg-surface-raised",
  quiet: "text-ink underline underline-offset-2 hover:text-accent",
  // Destructive reads as error, not accent — the accent is for the primary only.
  danger: "border border-error bg-surface text-error hover:bg-selected",
};

type ButtonProps = {
  variant?: Variant;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

type ButtonLinkProps = {
  variant?: Variant;
  className?: string;
  href: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">;

/** Same surface as Button, for navigation rather than action. */
export function ButtonLink({
  variant = "secondary",
  className = "",
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`${BASE} no-underline ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
