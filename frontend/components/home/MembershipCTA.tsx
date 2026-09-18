import { ArrowRight, UserPlus } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export function MembershipCTA() {
  return (
    <section className="container-peci py-24 sm:py-36">
      <div className="relative overflow-hidden rounded-3xl gradient-peci px-8 py-16 text-center sm:px-16">
        <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10" />

        <div className="relative mx-auto flex max-w-xl flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h2 className="font-display mt-6 text-3xl font-bold text-white sm:text-4xl">
            Rejoignez PECI
          </h2>
          <p className="mt-4 text-white/85">
            Rejoignez une communauté engagée pour la promotion de l&apos;éducation en Côte d&apos;Ivoire
            et recevez votre carte de membre numérique.
          </p>
          <LinkButton href="/devenir-membre" variant="secondary" size="lg" className="mt-8 bg-white text-peci-teal hover:bg-white/90">
            Devenir membre
            <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
