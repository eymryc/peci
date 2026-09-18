"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { useToast } from "@/components/ui/Toast";
import { LinkButton } from "@/components/ui/Button";
import type { ActionItem } from "@/types";

export default function AdminActionsPage() {
  const { token } = useAuth();
  const { push } = useToast();
  const [items, setItems] = useState<ActionItem[] | null>(null);

  const load = () => {
    if (!token) return;
    api.get<ActionItem[]>("/admin/actions", token).then(setItems);
  };

  useEffect(load, [token]);

  const remove = async (item: ActionItem) => {
    if (!token || !confirm(`Supprimer « ${item.title} » ?`)) return;
    try {
      await api.delete(`/admin/actions/${item.id}`, token);
      push("Action supprimée.");
      load();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur.", "error");
    }
  };

  if (!items) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-peci-dark">Nos actions</h1>
        <LinkButton href="/admin/actions/nouveau" size="sm">
          <Plus className="h-4 w-4" />
          Nouvelle action
        </LinkButton>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        {items.length === 0 ? (
          <p className="p-10 text-center text-sm text-peci-grey">Aucune action pour le moment.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 text-xs uppercase text-peci-grey">
              <tr>
                <th className="px-6 py-4">Titre</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Ordre</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-black/5 last:border-0">
                  <td className="px-6 py-4 font-medium text-peci-dark">{item.title}</td>
                  <td className="px-6 py-4 text-peci-grey">{item.category ?? "—"}</td>
                  <td className="px-6 py-4 text-peci-grey">{item.order ?? "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/actions/${item.id}`} className="text-peci-teal hover:underline">
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
