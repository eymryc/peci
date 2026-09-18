import { cn } from "@/lib/utils";

type Tone = "teal" | "green" | "grey" | "red" | "amber";

const tones: Record<Tone, string> = {
  teal: "bg-peci-teal/10 text-peci-teal",
  green: "bg-peci-green/10 text-peci-green-dark",
  grey: "bg-peci-grey-light text-peci-grey",
  red: "bg-red-50 text-red-600",
  amber: "bg-amber-50 text-amber-700",
};

export function Badge({
  children,
  tone = "teal",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
