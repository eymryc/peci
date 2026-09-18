import type { Metadata } from "next";
import { ActionCard } from "@/components/ActionCard";
import { api } from "@/lib/api";
import type { ActionItem } from "@/types";

export const metadata: Metadata = {
  title: "Nos actions",
  description: "Découvrez les actions de PECI en faveur de l'éducation en Côte d'Ivoire.",
};

export default async function NosActionsPage() {
  let actions: ActionItem[] = [];
  try {
    actions = await api.get<ActionItem[]>("/actions");
  } catch {
    actions = [];
  }

  const grouped = actions.reduce<Record<string, ActionItem[]>>((acc, action) => {
    const key = action.category ?? "Autres";
    acc[key] = acc[key] ? [...acc[key], action] : [action];
    return acc;
  }, {});

  return (
    <div className="container-peci py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
          Ce que nous faisons
        </span>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">Nos actions</h1>
      </div>

      <div className="mt-16 space-y-14">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="font-display text-xl font-bold text-peci-dark">{category}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((action) => (
                <ActionCard key={action.id} action={action} />
              ))}
            </div>
          </div>
        ))}

        {actions.length === 0 && (
          <p className="text-center text-sm text-peci-grey">Aucune action publiée pour le moment.</p>
        )}
      </div>
    </div>
  );
}
