import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "donate";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "btn-shimmer gradient-peci text-white shadow-lg shadow-peci-green/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-peci-green/30",
  secondary: "bg-peci-dark text-white hover:bg-peci-dark/90 hover:-translate-y-0.5",
  outline: "border-2 border-peci-teal text-peci-teal hover:-translate-y-0.5 hover:bg-peci-teal hover:text-white",
  ghost: "text-peci-dark hover:bg-peci-grey-light",
  donate:
    "btn-shimmer bg-peci-green text-white shadow-lg shadow-peci-green/35 hover:-translate-y-0.5 hover:bg-peci-green-dark hover:shadow-xl hover:shadow-peci-green/40",
};

const sizes: Record<Size, string> = {
  sm: "px-5 py-2.5 text-sm",
  md: "px-7 py-3.5 text-[15px]",
  lg: "px-9 py-4.5 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peci-teal focus-visible:ring-offset-2";

interface ButtonLinkProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  target,
  rel,
  onClick,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {children}
    </Link>
  );
}
