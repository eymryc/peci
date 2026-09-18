"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Users, FolderKanban } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import type { RegionStat } from "@/types";

// NOTE : représentation stylisée (grille), pas un tracé géographique exact de la
// Côte d'Ivoire. À remplacer par un vrai SVG des régions si un tracé officiel
// est fourni — le composant est conçu pour accepter les mêmes données (`regions`).
export function RegionsMap({ regions }: { regions: RegionStat[] }) {
  const active = useMemo(() => regions.filter((r) => r.projects_count > 0), [regions]);
  const [selected, setSelected] = useState<RegionStat | null>(active[0] ?? null);

  if (regions.length === 0) return null;

  return (
    <section className="container-peci py-24 sm:py-36">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
          Présence nationale
        </span>
        <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">
          Nos interventions en Côte d&apos;Ivoire
        </h2>
        <p className="mt-3 text-sm text-peci-grey">
          Sélectionnez une région pour voir les projets PECI qui y sont menés.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
          {regions.map((region) => {
            const isActive = region.projects_count > 0;
            const isSelected = selected?.slug === region.slug;
            return (
              <button
                key={region.slug}
                onClick={() => setSelected(region)}
                title={region.name}
                className={cn(
                  "aspect-square rounded-lg text-[10px] font-semibold uppercase tracking-tight transition-all",
                  isActive
                    ? "gradient-peci text-white hover:brightness-110"
                    : "bg-peci-grey-light text-peci-grey hover:bg-peci-grey-light/70",
                  isSelected && "ring-2 ring-peci-dark ring-offset-2"
                )}
              >
                <span className="flex h-full items-center justify-center px-1 text-center leading-tight">
                  {region.name}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div
          key={selected?.slug}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm"
        >
          {selected ? (
            <>
              <div className="flex items-center gap-2 text-peci-teal">
                <MapPin className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wide">Région</span>
              </div>
              <h3 className="font-display mt-2 text-2xl font-bold text-peci-dark">{selected.name}</h3>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-peci-grey-light p-4">
                  <FolderKanban className="h-5 w-5 text-peci-teal" />
                  <p className="mt-2 text-2xl font-bold text-peci-dark">
                    {formatNumber(selected.projects_count)}
                  </p>
                  <p className="text-xs text-peci-grey">Projet(s)</p>
                </div>
                <div className="rounded-xl bg-peci-grey-light p-4">
                  <Users className="h-5 w-5 text-peci-green-dark" />
                  <p className="mt-2 text-2xl font-bold text-peci-dark">
                    {formatNumber(selected.beneficiaries_count)}
                  </p>
                  <p className="text-xs text-peci-grey">Bénéficiaires</p>
                </div>
              </div>

              {selected.projects_count === 0 && (
                <p className="mt-5 text-sm text-peci-grey">
                  Aucun projet actif recensé pour le moment dans cette région.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-peci-grey">Sélectionnez une région sur la carte.</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
