"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { ActionForm } from "@/components/admin/ActionForm";
import type { ActionItem } from "@/types";

export default function EditActionPage() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const [action, setAction] = useState<ActionItem | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<ActionItem[]>("/admin/actions", token).then((items) => {
      setAction(items.find((a) => String(a.id) === params.id) ?? null);
    });
  }, [token, params.id]);

  if (!action) return <PageLoading />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Modifier l&apos;action</h1>
      <ActionForm action={action} />
    </div>
  );
}
