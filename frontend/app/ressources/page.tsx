import type { Metadata } from "next";
import { ResourcesExplorer } from "@/components/ResourcesExplorer";

export const metadata: Metadata = {
  title: "Ressources éducatives",
  description: "Guides, fiches pédagogiques, documents et publications de PECI.",
};

export default function RessourcesPage() {
  return (
    <div className="container-peci py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
          Pour aller plus loin
        </span>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">Ressources éducatives</h1>
        <p className="mt-3 text-peci-grey">
          Guides, fiches pédagogiques, documents et publications à télécharger librement.
        </p>
      </div>

      <div className="mt-14">
        <ResourcesExplorer />
      </div>
    </div>
  );
}
