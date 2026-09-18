"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { ArrowRight, PlayCircle, ChevronDown, Quote } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

// Sépare le premier mot du titre pour isoler son premier "o" (point de départ
// du zoom vers la vidéo) et garde le dernier mot pour le dégradé de marque.
function renderHeadline(headline: string, oRef: RefObject<HTMLSpanElement | null>): ReactNode {
  const words = headline.trim().split(" ");
  if (words.length === 0) return headline;

  const lastWord = words.length > 1 ? words.pop() : null;
  const firstWord = words.shift() ?? "";
  const middle = words.join(" ");
  const oIndex = firstWord.toLowerCase().indexOf("o");

  const firstWordNode =
    oIndex === -1 ? (
      firstWord
    ) : (
      <>
        {firstWord.slice(0, oIndex)}
        <span ref={oRef} className="relative inline-block">
          {firstWord[oIndex]}
        </span>
        {firstWord.slice(oIndex + 1)}
      </>
    );

  return (
    <>
      {firstWordNode}
      {middle ? ` ${middle}` : ""}
      {lastWord ? (
        <>
          {" "}
          <span className="gradient-peci-text">{lastWord}</span>
        </>
      ) : null}
    </>
  );
}

export function Hero({
  headline,
  subheadline,
  backgroundImage = "/images/rentree.jpg",
}: {
  headline: string;
  subheadline: string;
  backgroundImage?: string;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const oRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Coordonnées du "o" (en pixels écran) mises à jour de façon impérative via
  // .set() — pas de useState ici : recréer le useTransform ci-dessous à chaque
  // re-render casserait la liaison de motion.div avec la valeur animée.
  const anchorX = useMotionValue(0);
  const anchorY = useMotionValue(0);
  const maxRadius = useMotionValue(0);

  useEffect(() => {
    function measure() {
      const el = oRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const corners: [number, number][] = [
        [0, 0],
        [w, 0],
        [0, h],
        [w, h],
      ];
      anchorX.set(x);
      anchorY.set(y);
      maxRadius.set(Math.max(...corners.map(([cx, cy]) => Math.hypot(cx - x, cy - y))) + 40);
    }

    // Mesure DOM nécessaire pour ancrer le cercle exactement sur le "o" affiché —
    // impossible à calculer au rendu, seulement une fois la mise en page faite.
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [anchorX, anchorY, maxRadius]);

  const clipPath = useTransform(
    [scrollYProgress, anchorX, anchorY, maxRadius],
    (values: number[]) => {
      const [progress, x, y, maxR] = values;
      // Rien n'est visible au repos (r=0) : le cercle ne naît du "o" qu'au
      // premier pixel de scroll, pour ne jamais donner l'impression d'une
      // vidéo en arrière-plan avant que l'utilisateur ne descende la page.
      let r: number;
      if (progress <= 0.15) r = 0;
      else if (progress >= 0.85) r = maxR;
      else r = ((progress - 0.15) / 0.7) * maxR;
      return `circle(${r}px at ${x}px ${y}px)`;
    },
  );

  const headlineOpacity = useTransform(scrollYProgress, [0, 0.16, 0.32], [1, 1, 0]);
  const chevronOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.62, 0.85], [0, 1]);

  return (
    <section ref={containerRef} className="relative" style={{ height: "220vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-peci-dark">
        {/* Fond calme (image + dégradés) : aucune vidéo visible tant qu'on n'a pas
           scrollé — la vidéo n'apparaît qu'à travers le cercle qui s'ouvre depuis le "o". */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Élèves ivoiriens lors de la rentrée scolaire"
            fill
            priority
            sizes="100vw"
            className="animate-ken-burns object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-peci-dark via-peci-dark/75 to-peci-dark/50" />
          <div className="absolute inset-0 gradient-peci-vivid mix-blend-multiply opacity-40" />
        </div>

        {/* Halos animés — renforcent la présence du vert de la marque */}
        <div className="animate-float-slow absolute -top-24 -right-24 h-96 w-96 rounded-full bg-peci-green/25 blur-3xl" />
        <div className="animate-float-slow-reverse absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-peci-teal/30 blur-3xl" />
        <div className="animate-float-slow absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-peci-green-light/20 blur-2xl" />

        <motion.div style={{ opacity: headlineOpacity }} className="container-peci relative pb-32 pt-24 sm:pb-40 sm:pt-28 lg:pb-52 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-peci-green/40 bg-peci-green/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-peci-green-light backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-peci-green" />
              ONG · Promouvoir l&apos;éducation en Côte d&apos;Ivoire
            </motion.span>

            <h1 className="font-display mt-8 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {renderHeadline(headline, oRef)}
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">{subheadline}</p>

            <div className="mt-11 flex flex-wrap items-center gap-4">
              <LinkButton href="/nos-actions" size="lg">
                Découvrir nos actions
                <ArrowRight className="h-5 w-5" />
              </LinkButton>
              <LinkButton
                href="/devenir-membre"
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white hover:text-peci-teal"
              >
                <PlayCircle className="h-5 w-5" />
                Devenir membre
              </LinkButton>
            </div>

            <div className="mt-16 flex items-center gap-6 border-t border-white/15 pt-8 text-white/70 sm:mt-20">
              <p className="text-sm">Rejoignez une communauté déjà engagée pour l&apos;éducation</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ opacity: chevronOpacity }}
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 text-white/60 sm:block"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </motion.div>

        {/* Le cercle qui naît du "o" de Construire et s'ouvre au scroll pour
           révéler la vidéo — déposer hero.mp4/hero.webm dans public/videos/. */}
        <motion.div style={{ clipPath }} className="absolute inset-0 z-30 bg-peci-dark">
          {!videoFailed ? (
            <video autoPlay muted loop playsInline onError={() => setVideoFailed(true)} className="h-full w-full object-cover">
              <source src="/videos/hero.webm" type="video/webm" />
              <source src="/videos/hero.mp4" type="video/mp4" />
            </video>
          ) : (
            <Image src={backgroundImage} alt="" fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-peci-dark/30" />

          <motion.div
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 flex items-end bg-gradient-to-t from-peci-dark/95 via-peci-dark/30 to-transparent p-8 sm:p-14 lg:p-20"
          >
            <div className="max-w-2xl">
              <Quote className="h-8 w-8 text-peci-green-light" />
              <p className="font-display mt-4 text-2xl font-bold italic leading-snug text-white sm:text-3xl lg:text-4xl">
                « L&apos;éducation est l&apos;arme la plus puissante pour changer le monde. »
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-peci-green-light">
                — Nelson Mandela
              </p>
              <p className="mt-8 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
                Depuis 2020, PECI agit à travers des actions caritatives et innovantes pour les élèves,
                les enfants non scolarisés et les établissements scolaires dans le besoin.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
