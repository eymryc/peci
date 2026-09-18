"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { ResourceForm } from "@/components/admin/ResourceForm";
import type { Paginated, ResourceFile } from "@/types";

export default function EditResourcePage() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const [resource, setResource] = useState<ResourceFile | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<Paginated<ResourceFile>>("/admin/resources?per_page=200", token).then((res) => {
      setResource(res.items.find((r) => String(r.id) === params.id) ?? null);
    });
  }, [token, params.id]);

  if (!resource) return <PageLoading />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Modifier la ressource</h1>
      <ResourceForm resource={resource} />
    </div>
  );
}
