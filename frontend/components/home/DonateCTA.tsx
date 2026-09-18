import { Heart } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export function DonateCTA() {
  return (
    <section className="container-peci pb-20 sm:pb-28">
      <div className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-peci-green/20 bg-peci-grey-light px-8 py-14 text-center sm:flex-row sm:text-left">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-peci-green/15 text-peci-green-dark">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-peci-dark">Soutenez nos actions</h2>
            <p className="mt-2 max-w-md text-sm text-peci-grey">
              Chaque don contribue directement à l&apos;éducation d&apos;un enfant en Côte d&apos;Ivoire.
            </p>
          </div>
        </div>
        <LinkButton href="/don" variant="donate" size="lg" className="shrink-0">
          Faire un don
        </LinkButton>
      </div>
    </section>
  );
}
