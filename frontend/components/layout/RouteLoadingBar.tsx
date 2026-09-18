"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Barre de progression en haut de l'écran, affichée à chaque navigation
// (clic sur un lien interne) — donne un retour immédiat que quelque chose se
// passe, plutôt qu'un clic qui semble ne rien faire pendant le chargement.
export function RouteLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const safetyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUrl = useRef(`${pathname}?${searchParams.toString()}`);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Ne pas filtrer sur event.defaultPrevented : next/link appelle
      // toujours preventDefault() pour faire sa propre navigation côté
      // client, donc ce serait vrai pour absolument tous ses clics.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (`${url.pathname}${url.search}` === currentUrl.current) return;

      setLoading(true);
      if (safetyTimeout.current) clearTimeout(safetyTimeout.current);
      // Filet de sécurité si la navigation échoue silencieusement (ex. lien
      // vers une ancre gérée en JS) — évite une barre bloquée indéfiniment.
      safetyTimeout.current = setTimeout(() => setLoading(false), 8000);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    currentUrl.current = `${pathname}?${searchParams.toString()}`;
    // Synchronise la barre avec le pathname réel une fois la navigation
    // terminée — pas un état dérivable autrement puisqu'il dépend du clic
    // capté plus haut, hors du cycle de rendu React.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
    if (safetyTimeout.current) clearTimeout(safetyTimeout.current);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden bg-transparent">
      <div className="animate-route-loading h-full w-1/3 gradient-peci" />
    </div>
  );
}
