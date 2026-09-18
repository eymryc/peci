import Image from "next/image";
import { CheckCircle2, XCircle, Clock, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { VerifyResult } from "@/types";

export const metadata = {
  title: "Vérification de carte de membre",
};

const STATE_CONFIG = {
  VALID: {
    icon: CheckCircle2,
    color: "text-peci-green-dark",
    bg: "bg-peci-green/10",
    label: "Carte authentique",
  },
  EXPIRED: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Carte expirée",
  },
  SUSPENDED: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Carte suspendue",
  },
  NOT_FOUND: {
    icon: HelpCircle,
    color: "text-peci-grey",
    bg: "bg-peci-grey-light",
    label: "Carte introuvable",
  },
} as const;

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ memberNumber: string }>;
}) {
  const { memberNumber } = await params;

  let result: VerifyResult;
  try {
    result = await api.get<VerifyResult>(`/public/members/${encodeURIComponent(memberNumber)}/verify`);
  } catch {
    result = { state: "NOT_FOUND", valid: false };
  }

  const config = STATE_CONFIG[result.state];
  const Icon = config.icon;

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-peci-dark px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-2xl">
        <Image src="/brand/logo.jpg" alt="PECI" width={64} height={64} className="mx-auto rounded-full" />

        <div className={`mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full ${config.bg}`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>

        <p className={`mt-4 text-sm font-bold uppercase tracking-wide ${config.color}`}>
          {config.label}
        </p>

        {result.state === "NOT_FOUND" ? (
          <p className="mt-4 text-sm text-peci-grey">
            Aucune carte ne correspond au numéro « {memberNumber} ».
          </p>
        ) : (
          <div className="mt-6 space-y-3 text-left">
            <div className="rounded-xl bg-peci-grey-light p-4">
              <p className="font-display text-xl font-bold text-peci-dark">
                {result.prenoms} {result.nom}
              </p>
              <p className="mt-1 text-sm text-peci-grey">N° {result.member_number}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-peci-grey-light p-4">
                <p className="text-xs text-peci-grey">Statut</p>
                <p className="mt-1 font-semibold text-peci-dark">
                  {result.state === "VALID" ? "Membre actif" : config.label}
                </p>
              </div>
              <div className="rounded-xl bg-peci-grey-light p-4">
                <p className="text-xs text-peci-grey">Valide jusqu&apos;au</p>
                <p className="mt-1 font-semibold text-peci-dark">{formatDate(result.expires_at)}</p>
              </div>
            </div>
          </div>
        )}

        <p className="mt-8 text-xs text-peci-grey">
          Vérification officielle PECI — Promouvoir l&apos;éducation en Côte d&apos;Ivoire
        </p>
      </div>
    </div>
  );
}
