"use client";

import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LinkButton } from "@/components/ui/Button";
import { MembershipForm } from "@/components/forms/MembershipForm";
import type { MembershipType } from "@/types";

export function MembershipFormGate({ membershipTypes }: { membershipTypes: MembershipType[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user?.role === "member") {
    return (
      <div className="rounded-2xl border border-peci-green/20 bg-peci-grey-light p-10 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-peci-green-dark" />
        <h3 className="font-display mt-4 text-xl font-bold text-peci-dark">Vous êtes déjà inscrit</h3>
        <p className="mt-2 text-sm text-peci-grey">
          Ce compte est déjà lié à une adhésion PECI. Rendez-vous dans votre espace membre pour
          consulter votre carte, régler votre droit d&apos;adhésion ou vos cotisations.
        </p>
        <LinkButton href="/espace-membre" className="mt-6">
          Accéder à mon espace membre
        </LinkButton>
      </div>
    );
  }

  return <MembershipForm membershipTypes={membershipTypes} />;
}
