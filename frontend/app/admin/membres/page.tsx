"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, UserPlus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { Input, Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import type { Member, Paginated } from "@/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  under_review: "En vérification",
  approved: "Actif",
  rejected: "Refusé",
  suspended: "Suspendu",
  expired: "Expiré",
};

const STATUS_TONE: Record<string, "teal" | "green" | "grey" | "red" | "amber"> = {
  pending: "amber",
  under_review: "amber",
  approved: "green",
  rejected: "red",
  suspended: "red",
  expired: "grey",
};

function MembresContent() {
  const { token } = useAuth();
  const { push } = useToast();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [q, setQ] = useState("");
  const [data, setData] = useState<Paginated<Member> | null>(null);

  const load = () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    api.get<Paginated<Member>>(`/admin/members?${params.toString()}`, token).then(setData);
  };

  useEffect(() => {
    if (!token) return;
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status, q]);

  const remove = async (member: Member) => {
    if (!token || !confirm(`Supprimer « ${member.full_name} » ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/admin/members/${member.id}`, token);
      push("Membre supprimé.");
      load();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur lors de la suppression.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-peci-dark">Membres</h1>
        <LinkButton href="/admin/membres/nouveau" size="sm">
          <UserPlus className="h-4 w-4" />
          Nouveau membre
        </LinkButton>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-peci-grey" />
          <Input placeholder="Rechercher…" className="pl-10" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-56">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        {!data ? (
          <div className="p-10">
            <PageLoading />
          </div>
        ) : data.items.length === 0 ? (
          <p className="p-10 text-center text-sm text-peci-grey">Aucun membre trouvé.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 text-xs uppercase text-peci-grey">
              <tr>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">N° membre</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Téléphone</th>
                <th className="px-6 py-4">Adhésion</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((member) => (
                <tr key={member.id} className="border-b border-black/5 last:border-0 hover:bg-peci-grey-light/60">
                  <td className="px-6 py-4 font-medium text-peci-dark">
                    <Link href={`/admin/membres/${member.id}`} className="hover:text-peci-teal hover:underline">
                      {member.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-peci-grey">{member.member_number ?? "—"}</td>
                  <td className="px-6 py-4 text-peci-grey">{member.membership_type?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-peci-grey">{member.telephone}</td>
                  <td className="px-6 py-4 text-peci-grey">{formatDate(member.joined_at)}</td>
                  <td className="px-6 py-4">
                    <Badge tone={STATUS_TONE[member.status]}>{STATUS_LABEL[member.status]}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => remove(member)}
                      aria-label={`Supprimer ${member.full_name}`}
                      className="text-red-500 hover:underline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

export default function MembresPage() {
  return (
    <Suspense>
      <MembresContent />
    </Suspense>
  );
}
