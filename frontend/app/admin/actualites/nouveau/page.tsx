"use client";

import { NewsForm } from "@/components/admin/NewsForm";

export default function NouvelleActualitePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Nouvelle actualité</h1>
      <NewsForm />
    </div>
  );
}
