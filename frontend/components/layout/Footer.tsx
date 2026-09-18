import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, WhatsappIcon } from "@/components/ui/SocialIcons";

const LINKS = [
  { href: "/qui-sommes-nous", label: "À propos" },
  { href: "/nos-actions", label: "Actions" },
  { href: "/projets", label: "Projets" },
  { href: "/actualites", label: "Actualités" },
  { href: "/ressources", label: "Ressources" },
  { href: "/devenir-membre", label: "Devenir membre" },
  { href: "/don", label: "Faire un don" },
];

// Seuls réseaux réellement utilisés par PECI (pas de X/Twitter).
const SOCIALS = [
  { href: "https://www.facebook.com/share/1ZAGEAfujs/?mibextid=wwXIfr", label: "Facebook", icon: FacebookIcon },
  { href: "https://www.instagram.com/peci_abidjan?stkn=bzloZXFocmE1N3hn", label: "Instagram", icon: InstagramIcon },
  { href: "https://chat.whatsapp.com/IUNnlwKljoGJfDAtG7cL7U?s=cl&p=i&mlu=4&ilr=4", label: "WhatsApp", icon: WhatsappIcon },
];

export function Footer() {
  return (
    <footer className="bg-peci-dark text-white/80">
      <div className="container-peci py-14 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/brand/logo.jpg" alt="PECI" width={48} height={48} className="rounded-full bg-white" />
            <div>
              <p className="font-display text-lg font-bold text-white">PECI</p>
              <p className="text-xs uppercase tracking-wide text-white/60">
                Promouvoir l&apos;éducation en Côte d&apos;Ivoire
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            ONG engagée pour une éducation accessible, inclusive et de qualité, au service de la
            jeunesse ivoirienne.
          </p>
          <div className="mt-6 flex gap-3">
            {SOCIALS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-peci-teal"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Navigation</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/60 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Contact</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>Abidjan, Côte d&apos;Ivoire</li>
            <li>
              <a href="mailto:info@peci-ci.com" className="transition-colors hover:text-white">
                info@peci-ci.com
              </a>
            </li>
            <li>
              <a href="tel:+2250700001892" className="transition-colors hover:text-white">
                +225 07 00 00 18 92
              </a>
            </li>
            <li>
              <a href="https://www.peci-ci.com" className="transition-colors hover:text-white">
                www.peci-ci.com
              </a>
            </li>
          </ul>
          <Link
            href="/verifier"
            className="mt-4 inline-block text-sm text-peci-green hover:underline"
          >
            Vérifier une carte de membre
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-peci flex flex-col items-center justify-between gap-2 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} PECI — Tous droits réservés.</p>
          <p>Plateforme numérique officielle de PECI</p>
        </div>
      </div>
    </footer>
  );
}
