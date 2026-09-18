"use client";

import { useEffect, useState } from "react";
import { Wallet, ShieldCheck, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { MembershipPayment, MembershipPaymentsResponse } from "@/types";

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

const METHODS = [
  { value: "orange_money", label: "Orange Money" },
  { value: "mtn_money", label: "MTN Money" },
  { value: "moov_money", label: "Moov Money" },
  { value: "wave", label: "Wave" },
  { value: "card", label: "Carte bancaire" },
];

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatPeriod(period: string): string {
  const [year, month] = period.split("-");
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1)
  );
}

function MethodPicker({
  method,
  onSelectMethod,
  submitting,
  onConfirm,
}: {
  method: string;
  onSelectMethod: (method: string) => void;
  submitting: boolean;
  onConfirm: () => void;
}) {
  return (
    <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
      <p className="text-sm font-medium text-peci-dark">Méthode de paiement</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {METHODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onSelectMethod(m.value)}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              method === m.value
                ? "border-peci-teal bg-peci-teal/10 text-peci-teal"
                : "border-black/10 text-peci-grey hover:border-peci-teal/40"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <Button size="sm" disabled={submitting} onClick={onConfirm}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Confirmer la déclaration de paiement
      </Button>
      <p className="text-xs text-peci-grey">
        Le paiement en ligne n&apos;est pas encore activé — cette déclaration sera confirmée par
        notre équipe après réception.
      </p>
    </div>
  );
}

export default function CotisationsPage() {
  const { token } = useAuth();
  const { push } = useToast();
  const [data, setData] = useState<MembershipPaymentsResponse | null>(null);
  const [declaring, setDeclaring] = useState<"adhesion" | "cotisation" | null>(null);
  const [method, setMethod] = useState(METHODS[0].value);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!token) return;
    api.get<MembershipPaymentsResponse>("/member/payments", token).then(setData);
  };

  useEffect(load, [token]);

  if (!data) return <PageLoading />;

  const period = currentPeriod();
  const cotisationThisMonth = data.items.find(
    (p) => p.type === "cotisation" && p.period === period
  );

  const declarePayment = async (type: "adhesion" | "cotisation") => {
    if (!token) return;
    setSubmitting(true);
    try {
      await api.post(
        "/member/payments",
        { type, period: type === "cotisation" ? period : undefined, method },
        token
      );
      push("Paiement déclaré. Notre équipe le confirmera après réception.");
      setDeclaring(null);
      load();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur lors de la déclaration.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Mes cotisations</h1>

      {/* Droit d'adhésion */}
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-peci-teal/10 text-peci-teal">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-peci-dark">Droit d&apos;adhésion</p>
              <p className="text-sm text-peci-grey">{formatCurrency(data.fees.adhesion)} — à régler une seule fois</p>
            </div>
          </div>
          {data.adhesion_paid ? (
            <Badge tone="green">Payé</Badge>
          ) : (
            <Button
              size="sm"
              onClick={() => setDeclaring(declaring === "adhesion" ? null : "adhesion")}
            >
              Payer maintenant
            </Button>
          )}
        </div>
        {declaring === "adhesion" && !data.adhesion_paid && (
          <MethodPicker
            method={method}
            onSelectMethod={setMethod}
            submitting={submitting}
            onConfirm={() => declarePayment("adhesion")}
          />
        )}
      </div>

      {/* Cotisation du mois */}
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-peci-green/10 text-peci-green-dark">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-peci-dark capitalize">
                Cotisation de {formatPeriod(period)}
              </p>
              <p className="text-sm text-peci-grey">{formatCurrency(data.fees.cotisation)} / mois</p>
            </div>
          </div>
          {cotisationThisMonth ? (
            <Badge tone={STATUS_TONE[cotisationThisMonth.status]}>
              {STATUS_LABEL[cotisationThisMonth.status]}
            </Badge>
          ) : (
            <Button
              size="sm"
              onClick={() => setDeclaring(declaring === "cotisation" ? null : "cotisation")}
            >
              Payer ce mois
            </Button>
          )}
        </div>
        {declaring === "cotisation" && !cotisationThisMonth && (
          <MethodPicker
            method={method}
            onSelectMethod={setMethod}
            submitting={submitting}
            onConfirm={() => declarePayment("cotisation")}
          />
        )}
      </div>

      {/* Historique */}
      <div className="rounded-3xl border border-black/5 bg-white shadow-sm">
        <p className="border-b border-black/5 px-6 py-4 font-semibold text-peci-dark">Historique</p>
        {data.items.length === 0 ? (
          <div className="p-10 text-center">
            <Clock className="mx-auto h-8 w-8 text-peci-grey" />
            <p className="mt-4 text-sm text-peci-grey">Aucun paiement pour le moment.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 text-xs uppercase text-peci-grey">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Période</th>
                <th className="px-6 py-3">Montant</th>
                <th className="px-6 py-3">Méthode</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((payment) => (
                <tr key={payment.id} className="border-b border-black/5 last:border-0">
                  <td className="px-6 py-4 font-medium text-peci-dark">
                    {payment.type === "adhesion" ? "Droit d'adhésion" : "Cotisation"}
                  </td>
                  <td className="px-6 py-4 text-peci-grey capitalize">
                    {payment.period ? formatPeriod(payment.period) : "—"}
                  </td>
                  <td className="px-6 py-4">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 text-peci-grey">{payment.method ?? "—"}</td>
                  <td className="px-6 py-4 text-peci-grey">{formatDate(payment.paid_at)}</td>
                  <td className="px-6 py-4">
                    <Badge tone={STATUS_TONE[payment.status]}>{STATUS_LABEL[payment.status]}</Badge>
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
