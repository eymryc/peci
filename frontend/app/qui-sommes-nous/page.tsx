import type { Metadata } from "next";
import Image from "next/image";
import { GraduationCap, HeartHandshake, Sparkles, Gift, Quote, Target } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { FeaturedGalleryStrip } from "@/components/home/FeaturedGalleryStrip";
import { api } from "@/lib/api";
import type { GalleryImageItem } from "@/types";

export const metadata: Metadata = {
  title: "Qui sommes-nous",
  description: "Découvrez PECI, ONG créée en 2020 par Lybird Hien pour promouvoir l'éducation en Côte d'Ivoire.",
};

// Titres et icônes des missions/objectifs restent fixes (structure institutionnelle) ;
// seuls les textes sont modifiables depuis /admin/parametres.
const MISSION_ICONS = [GraduationCap, HeartHandshake, Sparkles, Gift];
const MISSION_TITLES = [
  "Conditions d'apprentissage",
  "Réinsertion scolaire",
  "Créativité des apprenants",
  "Évènements caritatifs",
];

type PublicSettings = Record<string, string>;

function splitLines(value: string | undefined): string[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
      <span className="h-1.5 w-1.5 rounded-full bg-peci-green" />
      {children}
    </span>
  );
}

export default async function QuiSommesNousPage() {
  let settings: PublicSettings = {};
  let featuredImages: GalleryImageItem[] = [];
  try {
    [settings, featuredImages] = await Promise.all([
      api.get<PublicSettings>("/public/settings"),
      api.get<GalleryImageItem[]>("/gallery?featured=1"),
    ]);
  } catch {
    settings = {};
    featuredImages = [];
  }

  const objectifs = splitLines(settings.public_about_objectifs);
  const missionTexts = splitLines(settings.public_about_missions);
  const heroImage = settings.public_about_hero_image || "/images/rentree.jpg";

  return (
    <div>
      <section className="relative overflow-hidden bg-peci-dark py-24 text-center text-white">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-peci-dark/70" />
        </div>
        <div className="container-peci relative">
          <span className="text-xs font-semibold uppercase tracking-widest text-peci-green">
            Qui sommes-nous
          </span>
          <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">PECI</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Promouvoir l&apos;éducation en Côte d&apos;Ivoire — une ONG engagée pour une éducation
            accessible, inclusive et de qualité.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="animate-float-slow pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-peci-green/20 blur-3xl" />
        <div className="animate-float-slow-reverse pointer-events-none absolute -right-24 top-[38%] -z-10 h-96 w-96 rounded-full bg-peci-teal/15 blur-3xl" />
        <div className="animate-float-slow pointer-events-none absolute -left-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-peci-green-light/20 blur-3xl" />

        <div className="container-peci">
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Notre organisation</Eyebrow>
            {settings.public_about_intro_paragraph_1 && (
              <p className="mt-5 text-lg leading-relaxed text-peci-dark/70">{settings.public_about_intro_paragraph_1}</p>
            )}
            {settings.public_about_intro_paragraph_2 && (
              <p className="mt-4 text-lg leading-relaxed text-peci-dark/70">{settings.public_about_intro_paragraph_2}</p>
            )}

            {settings.public_about_nb_text && (
              <div className="mt-8 rounded-2xl border-l-4 border-peci-green bg-white p-6 text-sm leading-relaxed text-peci-grey shadow-sm">
                {settings.public_about_nb_text}
              </div>
            )}
          </div>

          {objectifs.length > 0 && (
            <div className="mx-auto mt-16 max-w-3xl">
              <Eyebrow>Nos objectifs</Eyebrow>
              <ul className="mt-6 space-y-3">
                {objectifs.map((objectif) => (
                  <li
                    key={objectif}
                    className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-peci-green/15 text-peci-green-dark">
                      <Target className="h-3.5 w-3.5" />
                    </span>
                    <span className="leading-relaxed text-peci-dark/80">{objectif}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {missionTexts.length > 0 && (
            <div className="mt-16">
              <div className="text-center">
                <Eyebrow>Nos missions</Eyebrow>
              </div>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {missionTexts.map((text, index) => {
                  const Icon = MISSION_ICONS[index] ?? Sparkles;
                  return (
                    <div
                      key={index}
                      className="group rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
                    >
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-peci-teal/10 text-peci-teal transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mt-4 font-display font-bold text-peci-dark">
                        {MISSION_TITLES[index] ?? `Mission ${index + 1}`}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-peci-grey">{text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {settings.public_about_activity_text && (
            <div className="mx-auto mt-16 max-w-3xl rounded-2xl bg-peci-dark p-8 text-white shadow-lg sm:p-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-peci-green-light">
                Nos activités
              </span>
              <div className="mt-4 flex gap-4">
                <Gift className="h-6 w-6 flex-shrink-0 text-peci-green-light" />
                <p className="leading-relaxed text-white/85">{settings.public_about_activity_text}</p>
              </div>
            </div>
          )}

          {featuredImages.length > 0 && (
            <div className="mt-16">
              <div className="text-center">
                <Eyebrow>Sur le terrain</Eyebrow>
                <h2 className="font-display mt-3 text-2xl font-bold text-peci-dark sm:text-3xl">
                  Quelques moments de nos actions
                </h2>
              </div>
              <div className="mt-8">
                <FeaturedGalleryStrip images={featuredImages} />
              </div>
            </div>
          )}

          {settings.public_about_quote_text && (
            <div className="mx-auto mt-16 max-w-2xl rounded-3xl bg-white p-10 text-center shadow-sm">
              <Quote className="mx-auto h-8 w-8 text-peci-green" />
              <p className="font-display mt-4 text-2xl font-bold italic leading-snug text-peci-dark sm:text-3xl">
                « {settings.public_about_quote_text} »
              </p>
              {settings.public_about_quote_author && (
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-peci-teal">
                  {settings.public_about_quote_author}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-peci-dark py-16 text-center">
        <div className="container-peci">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Envie de contribuer à notre mission ?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton href="/devenir-membre">Devenir membre</LinkButton>
            <LinkButton href="/don" variant="outline" className="border-white/40 text-white hover:bg-white hover:text-peci-teal">
              Faire un don
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
