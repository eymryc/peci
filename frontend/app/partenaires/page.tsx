import type { Metadata } from "next";
import Image from "next/image";
import { api } from "@/lib/api";
import { PartnerInquiryForm } from "@/components/forms/PartnerInquiryForm";
import type { Partner } from "@/types";

export const metadata: Metadata = {
  title: "Nos partenaires",
  description: "Découvrez les partenaires officiels de PECI.",
};

export default async function PartenairesPage() {
  let partners: Partner[] = [];
  try {
    partners = await api.get<Partner[]>("/partners");
  } catch {
    partners = [];
  }

  return (
    <div className="container-peci py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
          Ensemble
        </span>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">Nos partenaires</h1>
      </div>

      {partners.length === 0 ? (
        <p className="mt-16 text-center text-sm text-peci-grey">Aucun partenaire publié pour le moment.</p>
      ) : (
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <div key={partner.id} className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm">
              {partner.logo_url ? (
                <Image
                  src={partner.logo_url}
                  alt={partner.name}
                  width={140}
                  height={60}
                  className="mx-auto h-12 w-auto object-contain"
                />
              ) : (
                <p className="font-display text-lg font-bold text-peci-dark">{partner.name}</p>
              )}
              {partner.description && <p className="mt-3 text-sm text-peci-grey">{partner.description}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="mx-auto mt-20 max-w-xl rounded-3xl border border-black/5 bg-peci-grey-light p-8 sm:p-10">
        <h2 className="font-display text-xl font-bold text-peci-dark">Devenir partenaire</h2>
        <p className="mt-2 text-sm text-peci-grey">
          Vous représentez une organisation souhaitant soutenir l&apos;éducation en Côte
          d&apos;Ivoire ? Contactez-nous.
        </p>
        <div className="mt-6">
          <PartnerInquiryForm />
        </div>
      </div>
    </div>
  );
}
