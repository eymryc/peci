"use client";

import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NouveauProjetPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Nouveau projet</h1>
      <ProjectForm />
      <p className="text-xs text-peci-grey">
        La galerie et la timeline du projet seront disponibles après la création.
      </p>
    </div>
  );
}
