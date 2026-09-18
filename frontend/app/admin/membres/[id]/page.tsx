"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Award, CheckCircle2, Circle, Download, FileText, Gift, ImageIcon, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError, downloadWithAuth, fetchAuthenticatedBlobUrl } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { MemberForm } from "@/components/admin/MemberForm";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Member } from "@/types";

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

const PAYMENT_STATUS_LABEL: Record<string, string> = { paid: "Payé", pending: "En attente", expired: "Expiré" };
const PAYMENT_STATUS_TONE: Record<string, "green" | "amber" | "grey"> = { paid: "green", pending: "amber", expired: "grey" };

export default function MemberDetailPage() {
  const { token } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<"pdf" | "image" | null>(null);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const [deliveringId, setDeliveringId] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = () => {
    if (!token) return;
    api.get<Member>(`/admin/members/${params.id}`, token).then(setMember);
  };

  useEffect(load, [token, params.id]);

  useEffect(() => {
    if (!token || !member?.card) return;
    let cancelled = false;
    fetchAuthenticatedBlobUrl(`/admin/members/${member.id}/card/image`, token).then((url) => {
      if (!cancelled) setCardImageUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [token, member?.id, member?.card]);

  if (!member) return <PageLoading />;

  const handleDownload = async (type: "pdf" | "image") => {
    if (!token) return;
    setDownloading(type);
    try {
      await downloadWithAuth(
        `/admin/members/${member.id}/card/${type}`,
        token,
        `carte-peci-${member.member_number}.${type === "pdf" ? "pdf" : "png"}`
      );
    } finally {
      setDownloading(null);
    }
  };

  const handleCertificateDownload = async () => {
    if (!token) return;
    setDownloadingCertificate(true);
    try {
      await downloadWithAuth(
        `/admin/members/${member.id}/certificate/pdf`,
        token,
        `certificat-peci-${member.member_number}.pdf`
      );
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const markDelivered = async (deliveryId: number) => {
    if (!token) return;
    setDeliveringId(deliveryId);
    try {
      await api.post(`/admin/members/${member.id}/deliveries/${deliveryId}/deliver`, {}, token);
      push("Article marqué comme remis.");
      load();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur lors de la mise à jour.", "error");
    } finally {
      setDeliveringId(null);
    }
  };

  const remove = async () => {
    if (!token || !confirm(`Supprimer « ${member.full_name} » ? Cette action est irréversible.`)) return;
    setRemoving(true);
    try {
      await api.delete(`/admin/members/${member.id}`, token);
      push("Membre supprimé.");
      router.push("/admin/membres");
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur lors de la suppression.", "error");
      setRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-peci-dark">{member.full_name}</h1>
          <Badge tone={STATUS_TONE[member.status]}>{STATUS_LABEL[member.status]}</Badge>
        </div>
        <button
          onClick={remove}
          disabled={removing}
          className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Supprimer ce membre
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <MemberForm member={member} />

        <div className="space-y-6">
          {member.membership_type?.card_eligible === false ? (
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <p className="flex items-center gap-2 font-semibold text-peci-dark">
                <Award className="h-4 w-4 text-peci-teal" />
                Certificat d&apos;adhésion
              </p>
              {member.status === "approved" ? (
                <>
                  <p className="mt-3 text-sm text-peci-grey">
                    Ce type de membre n&apos;a pas droit à la carte physique — un certificat
                    d&apos;adhésion est disponible à la place, aussi consultable depuis l&apos;espace
                    membre.
                  </p>
                  <div className="mt-4">
                    <Button size="sm" onClick={handleCertificateDownload} disabled={downloadingCertificate}>
                      <FileText className="h-4 w-4" />
                      Télécharger le certificat
                    </Button>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-peci-grey">
                  Le certificat sera disponible une fois le statut passé à « Actif ».
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <p className="font-semibold text-peci-dark">Carte de membre</p>
              {member.card ? (
                <>
                  <div className="mt-4 overflow-hidden rounded-xl border border-black/5">
                    {cardImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cardImageUrl} alt={`Carte de ${member.full_name}`} className="w-full" />
                    ) : (
                      <div className="flex aspect-[85.6/54] items-center justify-center bg-peci-grey-light text-xs text-peci-grey">
                        Chargement…
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-peci-grey">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Valide du {formatDate(member.card.issued_at)} au {formatDate(member.card.expires_at)}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleDownload("image")} disabled={downloading === "image"}>
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </Button>
                    <Button size="sm" onClick={() => handleDownload("pdf")} disabled={downloading === "pdf"}>
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-peci-grey">
                  Aucune carte générée. Passez le statut à « Actif » pour en générer une automatiquement.
                </p>
              )}
            </div>
          )}

          {member.merchandise_deliveries && member.merchandise_deliveries.length > 0 && (
            <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
              <p className="flex items-center gap-2 font-semibold text-peci-dark">
                <Gift className="h-4 w-4 text-peci-teal" />
                Kit à remettre par le bureau
              </p>
              <ul className="mt-3 divide-y divide-black/5">
                {member.merchandise_deliveries.map((delivery) => (
                  <li key={delivery.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className={delivery.delivered_at ? "text-peci-grey line-through" : "text-peci-dark"}>
                        {delivery.item}
                      </p>
                      {delivery.delivered_at && (
                        <p className="text-xs text-peci-grey">
                          Remis le {formatDate(delivery.delivered_at)}
                          {delivery.delivered_by ? ` par ${delivery.delivered_by}` : ""}
                        </p>
                      )}
                    </div>
                    {delivery.delivered_at ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-peci-green" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => markDelivered(delivery.id)}
                        disabled={deliveringId === delivery.id}
                        className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-peci-teal hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deliveringId === delivery.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                        Marquer remis
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-3xl border border-black/5 bg-white shadow-sm">
            <p className="border-b border-black/5 px-6 py-4 font-semibold text-peci-dark">Paiements</p>
            {!member.payments || member.payments.length === 0 ? (
              <div className="p-6 text-center">
                <Download className="mx-auto h-6 w-6 text-peci-grey" />
                <p className="mt-3 text-sm text-peci-grey">Aucun paiement déclaré.</p>
              </div>
            ) : (
              <ul className="divide-y divide-black/5">
                {member.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between px-6 py-3 text-sm">
                    <div>
                      <p className="font-medium text-peci-dark">
                        {payment.type === "adhesion" ? "Droit d'adhésion" : "Cotisation"}
                        {payment.period ? ` — ${payment.period}` : ""}
                      </p>
                      <p className="text-xs text-peci-grey">{formatCurrency(payment.amount)}</p>
                    </div>
                    <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>{PAYMENT_STATUS_LABEL[payment.status]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
