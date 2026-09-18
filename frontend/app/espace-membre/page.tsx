"use client";

import Link from "next/link";
import { Wallet, Bell, Award, ArrowUpRight } from "lucide-react";
import { useMember } from "@/lib/use-member";
import { useUnreadNotificationsCount } from "@/lib/use-unread-notifications";
import { PageLoading } from "@/components/ui/Loading";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  pending: "En attente",
  under_review: "En vérification",
  approved: "Membre actif",
  rejected: "Refusée",
  suspended: "Suspendu",
  expired: "Expiré",
};

export default function EspaceMembreDashboard() {
  const { member, loading, error } = useMember();
  const unreadCount = useUnreadNotificationsCount();

  if (loading) return <PageLoading />;
  if (error || !member) {
    return <p className="text-sm text-red-600">{error ?? "Profil introuvable."}</p>;
  }

  const type = member.membership_type;
  const hasFees = !type || type.adhesion_fee > 0 || type.cotisation_fee > 0;
  const hasCertificate = type?.card_eligible === false;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl gradient-peci p-8 text-white sm:p-10">
        <Badge tone="grey" className="bg-white/15 text-white">
          {STATUS_LABEL[member.status] ?? member.status}
        </Badge>
        <h1 className="font-display mt-4 text-2xl font-bold sm:text-3xl">
          Bonjour {member.prenoms}
        </h1>
        {member.member_number ? (
          <p className="mt-2 text-white/85">N° membre : {member.member_number}</p>
        ) : (
          <p className="mt-2 text-white/85">
            Votre demande d&apos;adhésion est en cours de traitement.
          </p>
        )}
        {member.joined_at && (
          <p className="mt-1 text-sm text-white/70">
            Adhésion : {formatDate(member.joined_at)} · Expire le {formatDate(member.expires_at)}
          </p>
        )}
        {!member.adhesion_confirmed_at && member.status === "approved" && hasFees && (
          <p className="mt-3 max-w-lg text-sm text-white/85">
            Réglez votre droit d&apos;adhésion pour finaliser votre statut de membre : vous
            recevrez alors un SMS de bienvenue{hasCertificate
              ? "."
              : " et le bureau vous contactera pour la remise de votre carte et de votre kit de membre."}
          </p>
        )}
        {member.adhesion_confirmed_at && !hasCertificate && (
          <p className="mt-3 max-w-lg text-sm text-white/85">
            Adhésion confirmée — le bureau vous contactera pour la remise de votre carte de
            membre et de votre kit.
          </p>
        )}
        {member.adhesion_confirmed_at && hasCertificate && (
          <p className="mt-3 max-w-lg text-sm text-white/85">
            Adhésion confirmée — retrouvez votre certificat d&apos;adhésion ci-dessous.
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {hasFees && (
          <Link
            href="/espace-membre/cotisations"
            className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <Wallet className="h-6 w-6 text-peci-teal" />
              <p className="mt-3 font-semibold text-peci-dark">Mes cotisations</p>
              <p className="text-xs text-peci-grey">Droit d&apos;adhésion, cotisations mensuelles</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-peci-grey opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        )}

        {hasCertificate && (
          <Link
            href="/espace-membre/certificat"
            className="group flex items-center justify-between rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div>
              <Award className="h-6 w-6 text-peci-teal" />
              <p className="mt-3 font-semibold text-peci-dark">Mon certificat</p>
              <p className="text-xs text-peci-grey">Certificat d&apos;adhésion</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-peci-grey opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        )}

        <Link
          href="/espace-membre/notifications"
          className="group relative flex items-center justify-between rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          {unreadCount > 0 && (
            <span className="absolute right-5 top-5 flex h-5 min-w-5 items-center justify-center rounded-full bg-peci-green px-1.5 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <div>
            <Bell className="h-6 w-6 text-peci-teal" />
            <p className="mt-3 font-semibold text-peci-dark">Notifications</p>
            <p className="text-xs text-peci-grey">Suivez votre dossier</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-peci-grey opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      </div>
    </div>
  );
}
