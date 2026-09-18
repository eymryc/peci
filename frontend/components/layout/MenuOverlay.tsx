"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ArrowUpRight, X, GraduationCap, Heart } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { FacebookIcon, InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";

const PRIMARY_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
  { href: "/nos-actions", label: "Nos actions" },
  { href: "/projets", label: "Nos projets" },
];

const SECONDARY_LINKS = [
  { href: "/#impact", label: "Notre impact" },
  { href: "/actualites", label: "Actualités" },
  { href: "/ressources", label: "Ressources" },
  { href: "/galerie", label: "Galerie" },
  { href: "/partenaires", label: "Partenaires" },
];

const UTILITY_LINKS = [
  { href: "/verifier", label: "Vérifier une carte" },
  { href: "/connexion", label: "Connexion" },
];

const SOCIALS = [
  { href: "https://www.facebook.com/share/1ZAGEAfujs/?mibextid=wwXIfr", label: "Facebook", icon: FacebookIcon },
  { href: "https://www.instagram.com/peci_abidjan?stkn=bzloZXFocmE1N3hn", label: "Instagram", icon: InstagramIcon },
  { href: "https://chat.whatsapp.com/IUNnlwKljoGJfDAtG7cL7U?s=cl&p=i&mlu=4&ilr=4", label: "WhatsApp", icon: WhatsappIcon },
];

// Mots-clés qui entourent le logo PECI sur les supports de communication —
// utilisés ici en flottement discret, à la manière des fleurs animées du
// menu de farmafrica.org.
const FLOATING_WORDS: {
  text: string;
  top: string;
  left?: string;
  right?: string;
  size: string;
  color: string;
  duration: number;
  delay: number;
}[] = [
  { text: "ÉDUCATION", top: "6%", left: "4%", size: "text-lg", color: "text-peci-green/15", duration: 7, delay: 0 },
  { text: "INCLUSION", top: "16%", right: "6%", size: "text-2xl", color: "text-peci-teal/15", duration: 8, delay: 0.6 },
  { text: "PÉDAGOGIE", top: "30%", right: "1%", size: "text-base", color: "text-white/10", duration: 6.5, delay: 1.1 },
  { text: "ALPHABÉTISATION", top: "44%", left: "1%", size: "text-sm", color: "text-peci-green/15", duration: 9, delay: 0.3 },
  { text: "SCOLARISATION", top: "60%", right: "4%", size: "text-lg", color: "text-peci-teal/15", duration: 7.5, delay: 1.4 },
  { text: "ENSEIGNER", top: "72%", left: "3%", size: "text-xl", color: "text-white/10", duration: 6, delay: 0.8 },
  { text: "JEUNESSE", top: "88%", left: "8%", size: "text-lg", color: "text-peci-teal/15", duration: 8.5, delay: 1.8 },
  { text: "CAUSES", top: "84%", right: "9%", size: "text-base", color: "text-peci-green/15", duration: 7, delay: 0.5 },
];

// Fleur simple à 6 pétales, en aplat `currentColor` — reprend l'esprit des
// fleurs animées du menu de farmafrica.org, mais aux couleurs PECI.
function FlowerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-20 -20 40 40" {...props}>
      {Array.from({ length: 6 }).map((_, i) => (
        <ellipse key={i} cx="0" cy="-8" rx="5.5" ry="10" fill="currentColor" transform={`rotate(${i * 60})`} />
      ))}
      <circle cx="0" cy="0" r="4.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

const FLOATING_FLOWERS: {
  top: string;
  left?: string;
  right?: string;
  size: string;
  color: string;
  duration: number;
  delay: number;
}[] = [
  { top: "11%", left: "16%", size: "h-8 w-8", color: "text-peci-green/25", duration: 10, delay: 0.2 },
  { top: "22%", right: "18%", size: "h-6 w-6", color: "text-peci-teal/25", duration: 8, delay: 0.9 },
  { top: "38%", left: "9%", size: "h-5 w-5", color: "text-peci-green-light/20", duration: 9, delay: 1.5 },
  { top: "52%", right: "12%", size: "h-9 w-9", color: "text-peci-teal/20", duration: 11, delay: 0.4 },
  { top: "66%", left: "18%", size: "h-6 w-6", color: "text-peci-green/25", duration: 7.5, delay: 1.1 },
  { top: "80%", right: "20%", size: "h-7 w-7", color: "text-peci-green-light/20", duration: 10.5, delay: 0.7 },
  { top: "93%", left: "24%", size: "h-5 w-5", color: "text-peci-teal/20", duration: 8.5, delay: 1.8 },
];

function FloatingFlowers() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      {FLOATING_FLOWERS.map((flower, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -20, 0], rotate: 360 }}
          transition={{
            opacity: { duration: 0.8, delay: flower.delay },
            y: { duration: flower.duration, repeat: Infinity, ease: "easeInOut", delay: flower.delay },
            rotate: { duration: flower.duration * 2.5, repeat: Infinity, ease: "linear", delay: flower.delay },
          }}
          className="absolute"
          style={{ top: flower.top, left: flower.left, right: flower.right }}
        >
          <FlowerIcon className={`${flower.size} ${flower.color}`} />
        </motion.div>
      ))}
    </div>
  );
}

function FloatingWords() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      {FLOATING_WORDS.map((word) => (
        <motion.span
          key={word.text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -16, 0], rotate: [0, 2.5, -2.5, 0] }}
          transition={{
            opacity: { duration: 0.8, delay: word.delay },
            y: { duration: word.duration, repeat: Infinity, ease: "easeInOut", delay: word.delay },
            rotate: { duration: word.duration, repeat: Infinity, ease: "easeInOut", delay: word.delay },
          }}
          className={`font-display absolute font-extrabold uppercase tracking-widest ${word.size} ${word.color}`}
          style={{ top: word.top, left: word.left, right: word.right }}
        >
          {word.text}
        </motion.span>
      ))}
    </div>
  );
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ clipPath: "circle(2% at 50% 0%)" }}
          animate={{ clipPath: "circle(150% at 50% 0%)" }}
          exit={{ clipPath: "circle(2% at 50% 0%)" }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          className="pattern-peci-dots fixed inset-0 z-[90] overflow-y-auto bg-peci-forest"
        >
          <FloatingFlowers />
          <FloatingWords />

          <div className="container-peci relative flex min-h-screen flex-col py-8">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                <Image src="/brand/logo.jpg" alt="PECI" width={40} height={40} className="rounded-full" />
                <span className="font-display text-lg font-extrabold text-white">PECI</span>
              </Link>
            </div>

            <div className="mt-12 grid flex-1 gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
              <div>
                <motion.nav
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="grid gap-x-10 gap-y-2 sm:grid-cols-2"
                >
                  {PRIMARY_LINKS.map((link) => {
                    const active = pathname === link.href;
                    return (
                      <motion.div key={link.href} variants={itemVariants}>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className={`font-display block py-2.5 text-4xl font-extrabold tracking-tight transition-colors sm:text-5xl ${
                            active ? "text-peci-green" : "text-white hover:text-peci-green"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>

                <motion.nav
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="mt-10 grid gap-x-10 gap-y-1 border-t border-white/10 pt-8 sm:grid-cols-2"
                >
                  {SECONDARY_LINKS.map((link) => (
                    <motion.div key={link.href} variants={itemVariants}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="block py-1.5 text-lg font-medium text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>

                <div className="mt-10 border-t border-white/10 pt-8">
                  <form
                    role="search"
                    className="flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-white/60 transition-colors focus-within:border-peci-green/50"
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <Search className="h-4 w-4 shrink-0" />
                    <input
                      type="search"
                      placeholder="Rechercher sur le site…"
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                    />
                  </form>

                  <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
                    {UTILITY_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className="text-sm font-semibold text-white/70 hover:text-peci-green"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="flex gap-2.5">
                      {SOCIALS.map(({ href, label, icon: Icon }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-peci-green hover:text-peci-green"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="relative h-fit rounded-3xl bg-peci-cream p-8"
              >
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <span className="absolute inset-0 rotate-6 rounded-2xl bg-peci-teal/15" />
                  <span className="absolute inset-0 -rotate-6 rounded-2xl bg-peci-green/20" />
                  <GraduationCap className="relative h-8 w-8 text-peci-teal" />
                </div>

                <h3 className="font-display mt-6 text-2xl font-extrabold text-peci-dark">
                  Rejoignez PECI
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-peci-grey">
                  Aidez-nous à changer la vie des enfants ivoiriens en devenant membre ou en
                  soutenant nos actions dès aujourd&apos;hui.
                </p>

                <div className="mt-6 flex flex-col gap-2.5">
                  <LinkButton href="/devenir-membre" onClick={onClose} className="w-full">
                    Devenir membre
                    <ArrowUpRight className="h-4 w-4" />
                  </LinkButton>
                  <LinkButton href="/don" variant="donate" onClick={onClose} className="w-full">
                    <Heart className="h-4 w-4 fill-current" />
                    Faire un don
                  </LinkButton>
                </div>
              </motion.div>
            </div>

            <button
              onClick={onClose}
              aria-label="Fermer le menu"
              className="group mx-auto mt-10 flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-peci-green hover:text-white"
            >
              <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Fermer
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
