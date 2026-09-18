import { ActionCard } from "@/components/ActionCard";
import { LinkButton } from "@/components/ui/Button";
import type { ActionItem } from "@/types";

export function ActionsSection({ actions }: { actions: ActionItem[] }) {
  if (actions.length === 0) return null;

  return (
    <section className="container-peci py-24 sm:py-36">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-peci-green" />
            Ce que nous faisons
          </span>
          <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">
            Nos actions
          </h2>
        </div>
      </div>

      <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <ActionCard key={action.id} action={action} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <LinkButton href="/nos-actions" variant="outline">
          Voir toutes nos actions
        </LinkButton>
      </div>
    </section>
  );
}
