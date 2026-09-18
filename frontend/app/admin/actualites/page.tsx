"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { LinkButton } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { NewsArticle, Paginated } from "@/types";

export default function AdminActualitesPage() {
  const { token } = useAuth();
  const { push } = useToast();
  const [items, setItems] = useState<NewsArticle[] | null>(null);

  const load = () => {
    if (!token) return;
    api.get<Paginated<NewsArticle>>("/admin/news", token).then((res) => setItems(res.items));
  };

  useEffect(load, [token]);

  const remove = async (item: NewsArticle) => {
    if (!token || !confirm(`Supprimer « ${item.title} » ?`)) return;
    try {
      await api.delete(`/admin/news/${item.id}`, token);
      push("Actualité supprimée.");
      load();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur.", "error");
    }
  };

  if (!items) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-peci-dark">Actualités</h1>
        <LinkButton href="/admin/actualites/nouveau" size="sm">
          <Plus className="h-4 w-4" />
          Nouvelle actualité
        </LinkButton>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        {items.length === 0 ? (
          <p className="p-10 text-center text-sm text-peci-grey">Aucune actualité pour le moment.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 text-xs uppercase text-peci-grey">
              <tr>
                <th className="px-6 py-4">Titre</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Publiée le</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-black/5 last:border-0">
                  <td className="px-6 py-4 font-medium text-peci-dark">{item.title}</td>
                  <td className="px-6 py-4 text-peci-grey">{item.category ?? "—"}</td>
                  <td className="px-6 py-4">
                    <Badge tone={item.status === "published" ? "green" : "grey"}>
                      {item.status === "published" ? "Publiée" : "Brouillon"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-peci-grey">{formatDate(item.published_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/actualites/${item.id}`} className="text-peci-teal hover:underline">
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
