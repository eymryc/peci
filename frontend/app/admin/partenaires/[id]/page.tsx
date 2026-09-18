"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { PartnerForm } from "@/components/admin/PartnerForm";
import type { Partner } from "@/types";

export default function EditPartnerPage() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<Partner[]>("/admin/partners", token).then((items) => {
      setPartner(items.find((p) => String(p.id) === params.id) ?? null);
    });
  }, [token, params.id]);

  if (!partner) return <PageLoading />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Modifier le partenaire</h1>
      <PartnerForm partner={partner} />
    </div>
  );
}
