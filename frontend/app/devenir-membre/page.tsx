import type { Metadata } from "next";
import { ShieldCheck, IdCard, QrCode } from "lucide-react";
import { api } from "@/lib/api";
import { MembershipFormGate } from "@/components/forms/MembershipFormGate";
import type { MembershipType } from "@/types";

export const metadata: Metadata = {
  title: "Devenir membre",
  description: "Rejoignez une communauté engagée pour la promotion de l'éducation en Côte d'Ivoire.",
};

const STEPS = [
  { icon: ShieldCheck, title: "Vérification", text: "Votre dossier est étudié par notre équipe." },
  { icon: IdCard, title: "Numéro de membre", text: "Un numéro unique PECI-{année}-{n°} vous est attribué." },
  {
    icon: QrCode,
    title: "Espace membre",
    text: "Connectez-vous pour télécharger votre carte et régler votre droit d'adhésion et vos cotisations.",
  },
];

export default async function DevenirMembrePage() {
  let membershipTypes: MembershipType[] = [];
  try {
    membershipTypes = await api.get<MembershipType[]>("/public/membership-types");
  } catch {
    membershipTypes = [];
  }

  return (
    <div className="bg-peci-grey-light">
      <div className="container-peci py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
              Adhésion
            </span>
            <h1 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">
              Rejoignez PECI
            </h1>
            <p className="mt-4 text-peci-grey">
              Membre actif, bienfaiteur (donateur) ou honoraire : rejoignez une communauté
              engagée pour la promotion de l&apos;éducation en Côte d&apos;Ivoire.
            </p>

            <div className="mt-10 space-y-6">
              {STEPS.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-peci text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-peci-dark">
                      <step.icon className="h-4 w-4 text-peci-teal" /> {step.title}
                    </p>
                    <p className="mt-1 text-sm text-peci-grey">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
            <MembershipFormGate membershipTypes={membershipTypes} />
          </div>
        </div>
      </div>
    </div>
  );
}
