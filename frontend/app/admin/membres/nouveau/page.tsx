"use client";

import { MemberForm } from "@/components/admin/MemberForm";

export default function NouveauMembrePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Nouveau membre</h1>
      <MemberForm />
    </div>
  );
}
