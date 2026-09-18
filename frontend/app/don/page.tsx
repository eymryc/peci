import type { Metadata } from "next";
import { DonationForm } from "@/components/forms/DonationForm";

export const metadata: Metadata = {
  title: "Faire un don",
  description: "Soutenez les actions de PECI en faveur de l'éducation en Côte d'Ivoire.",
};

export default function DonPage() {
  return (
    <div className="bg-peci-grey-light py-20 sm:py-28">
      <div className="container-peci max-w-2xl">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
            Soutenez-nous
          </span>
          <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">Faire un don</h1>
          <p className="mt-3 text-peci-grey">
            Chaque don contribue directement à l&apos;éducation d&apos;un enfant en Côte d&apos;Ivoire.
          </p>
        </div>

        <div className="mt-12">
          <DonationForm />
        </div>
      </div>
    </div>
  );
}
