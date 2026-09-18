"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { LinkButton } from "@/components/ui/Button";
import { MenuOverlay } from "@/components/layout/MenuOverlay";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  const accountHref = user ? (user.role === "member" ? "/espace-membre" : "/admin") : "/connexion";

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        <div
          className={cn(
            "w-full border-b transition-all duration-300",
            scrolled
              ? "border-black/5 bg-peci-mint/90 py-2.5 shadow-[0_8px_30px_-12px_rgba(23,167,157,0.25)] backdrop-blur-xl"
              : "border-transparent bg-peci-mint py-4"
          )}
        >
          <div className="container-peci flex items-center justify-between gap-4">
            <Link href="/" className="group flex shrink-0 items-center gap-3">
              <span className="relative flex h-12 w-12 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-peci-green/0 blur-md transition-all duration-300 group-hover:bg-peci-green/40" />
                <Image
                  src="/brand/logo.jpg"
                  alt="PECI"
                  width={48}
                  height={48}
                  className="relative rounded-full ring-2 ring-transparent transition-all duration-300 group-hover:ring-peci-green/50"
                  priority
                />
              </span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="font-display text-xl font-extrabold tracking-tight text-peci-teal">
                  PECI
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-peci-grey">
                  Promouvoir l&apos;éducation en Côte d&apos;Ivoire
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href={accountHref}
                className="hidden items-center gap-1.5 text-sm font-semibold text-peci-dark/75 transition-colors hover:text-peci-teal lg:flex"
              >
                <User className="h-4 w-4" />
                {user ? user.name.split(" ")[0] : "Connexion"}
              </Link>
              <LinkButton href="/devenir-membre" variant="outline" size="sm" className="hidden lg:inline-flex">
                Devenir membre
              </LinkButton>
              <LinkButton href="/don" variant="donate" size="sm" className="animate-pulse-glow">
                <Heart className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline">Faire un don</span>
              </LinkButton>

              <button
                onClick={() => setMenuOpen(true)}
                aria-label="Ouvrir le menu"
                className="ml-1 flex items-center gap-2 rounded-full bg-peci-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-peci-teal"
              >
                <Menu className="h-4 w-4" />
                <span className="hidden sm:inline">Menu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Onglet circulaire — signature visuelle du menu, ancré au bord du header */}
        <motion.button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          animate={menuOpen ? {} : { y: [0, 4, 0] }}
          transition={{ duration: 2.4, repeat: menuOpen ? 0 : Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className={cn(
            "absolute left-1/2 top-full hidden h-9 w-20 -translate-x-1/2 items-center justify-center rounded-b-2xl gradient-peci shadow-md sm:flex",
            !menuOpen && "animate-pulse-glow"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={menuOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex"
            >
              {menuOpen ? <X className="h-4 w-4 text-white" /> : <Menu className="h-4 w-4 text-white" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </header>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
