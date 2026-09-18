"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { LinkButton } from "@/components/ui/Button";
import type { Partner } from "@/types";

export default function AdminPartenairesPage() {
  const { token } = useAuth();
  const { push } = useToast();
  const [items, setItems] = useState<Partner[] | null>(null);

  const load = () => {
    if (!token) return;
    api.get<Partner[]>("/admin/partners", token).then(setItems);
  };

  useEffect(load, [token]);

  const remove = async (item: Partner) => {
    if (!token || !confirm(`Supprimer « ${item.name} » ?`)) return;
    try {
      await api.delete(`/admin/partners/${item.id}`, token);
      push("Partenaire supprimé.");
      load();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur.", "error");
    }
  };

  if (!items) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-peci-dark">Partenaires</h1>
        <LinkButton href="/admin/partenaires/nouveau" size="sm">
          <Plus className="h-4 w-4" />
          Nouveau partenaire
        </LinkButton>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        {items.length === 0 ? (
          <p className="p-10 text-center text-sm text-peci-grey">Aucun partenaire pour le moment.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 text-xs uppercase text-peci-grey">
              <tr>
                <th className="px-6 py-4">Logo</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-black/5 last:border-0">
                  <td className="px-6 py-4">
                    {item.logo_url ? (
                      <Image src={item.logo_url} alt={item.name} width={40} height={40} className="h-8 w-auto object-contain" />
                    ) : (
                      <span className="text-xs text-peci-grey">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-peci-dark">{item.name}</td>
                  <td className="px-6 py-4 text-peci-grey">{item.type ?? "—"}</td>
                  <td className="px-6 py-4">
                    <Badge tone={item.is_active !== false ? "green" : "grey"}>
                      {item.is_active !== false ? "Actif" : "Inactif"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/partenaires/${item.id}`} className="text-peci-teal hover:underline">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button onClick={() => remove(item)} className="text-red-500 hover:underline">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
