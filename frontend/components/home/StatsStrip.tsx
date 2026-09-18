import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/utils";

export function StatsStrip({
  stats,
}: {
  stats: { label: string; value: number }[];
}) {
  return (
    <section className="relative border-y border-black/5 bg-peci-grey-light">
      <div className="absolute inset-x-0 top-0 h-[3px] gradient-peci opacity-70" />
      <div className="container-peci grid grid-cols-2 gap-8 py-14 sm:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="text-center">
            <p
              className={cn(
                "font-display text-4xl font-extrabold sm:text-5xl",
                index % 2 === 0 ? "text-peci-teal" : "text-peci-green-dark"
              )}
            >
              <AnimatedCounter value={stat.value} suffix="+" />
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-peci-grey sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
