"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils";
import type { MembershipPayment, Paginated } from "@/types";

interface AdminPayment extends MembershipPayment {
  member: { id: number; full_name: string; member_number: string | null };
}

const STATUS_LABEL: Record<MembershipPayment["status"], string> = {
  paid: "Payé",
  pending: "En attente",
  expired: "Expiré",
};

const STATUS_TONE: Record<MembershipPayment["status"], "green" | "amber" | "grey"> = {
  paid: "green",
  pending: "amber",
  expired: "grey",
};

export default function AdminPaiementsPage() {
  const { token } = useAuth();
  const { push } = useToast();
  const [status, setStatus] = useState("pending");
  const [data, setData] = useState<Paginated<AdminPayment> | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = () => {
    if (!token) return;
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    api.get<Paginated<AdminPayment>>(`/admin/payments?${params.toString()}`, token).then(setData);
  };

  useEffect(load, [token, status]);

  const markPaid = async (payment: AdminPayment) => {
    if (!token) return;
    setBusy(payment.id);
    try {
      await api.post(`/admin/payments/${payment.id}/mark-paid`, undefined, token);
      push(`Paiement de ${payment.member.full_name} marqué payé.`);
      load();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur.", "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-peci-dark">Paiements</h1>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-56">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="paid">Payé</option>
          <option value="expired">Expiré</option>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
        {!data ? (
          <div className="p-10">
            <PageLoading />
          </div>
        ) : data.items.length === 0 ? (
          <p className="p-10 text-center text-sm text-peci-grey">Aucun paiement trouvé.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 text-xs uppercase text-peci-grey">
              <tr>
                <th className="px-6 py-4">Membre</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Période</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Méthode</th>
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((payment) => (
                <tr key={payment.id} className="border-b border-black/5 last:border-0">
                  <td className="px-6 py-4">
                    <p className="font-medium text-peci-dark">{payment.member.full_name}</p>
                    <p className="text-xs text-peci-grey">{payment.member.member_number ?? "—"}</p>
                  </td>
                  <td className="px-6 py-4 text-peci-grey">
                    {payment.type === "adhesion" ? "Droit d'adhésion" : "Cotisation"}
                  </td>
                  <td className="px-6 py-4 text-peci-grey">{payment.period ?? "—"}</td>
                  <td className="px-6 py-4">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 text-peci-grey">{payment.method ?? "—"}</td>
                  <td className="px-6 py-4 text-peci-grey">{payment.reference ?? "—"}</td>
                  <td className="px-6 py-4">
                    <Badge tone={STATUS_TONE[payment.status]}>{STATUS_LABEL[payment.status]}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    {payment.status !== "paid" && (
                      <Button size="sm" disabled={busy === payment.id} onClick={() => markPaid(payment)}>
                        {busy === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Marquer payé
                      </Button>
                    )}
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
