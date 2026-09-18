import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import type { Partner } from "@/types";

export function PartnersStrip({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  return (
    <section className="container-peci py-16">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-peci-grey">
        Ils nous font confiance
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {partners.map((partner) =>
          partner.logo_url ? (
            <Image
              key={partner.id}
              src={partner.logo_url}
              alt={partner.name}
              width={120}
              height={48}
              className="h-10 w-auto object-contain grayscale transition-all hover:grayscale-0"
            />
          ) : (
            <span key={partner.id} className="text-sm font-semibold text-peci-grey">
              {partner.name}
            </span>
          )
        )}
      </div>

      <div className="mt-8 text-center">
        <LinkButton href="/partenaires" variant="ghost" size="sm">
          Voir tous nos partenaires
        </LinkButton>
      </div>
    </section>
  );
}
