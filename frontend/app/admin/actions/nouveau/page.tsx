"use client";

import { ActionForm } from "@/components/admin/ActionForm";

export default function NouvelleActionPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Nouvelle action</h1>
      <ActionForm />
    </div>
  );
}
