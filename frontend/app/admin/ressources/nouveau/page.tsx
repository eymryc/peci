"use client";

import { ResourceForm } from "@/components/admin/ResourceForm";

export default function NouvelleRessourcePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Nouvelle ressource</h1>
      <ResourceForm />
    </div>
  );
}
