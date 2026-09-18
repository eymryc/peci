"use client";

import { PartnerForm } from "@/components/admin/PartnerForm";

export default function NouveauPartenairePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Nouveau partenaire</h1>
      <PartnerForm />
    </div>
  );
}
