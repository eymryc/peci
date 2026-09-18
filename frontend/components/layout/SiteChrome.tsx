"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingSchoolIcons } from "@/components/layout/FloatingSchoolIcons";
import { RouteLoadingBar } from "@/components/layout/RouteLoadingBar";

// L'espace /admin a sa propre coquille (sidebar + topbar) : on masque le
// header/footer publics pour éviter une double navigation à l'écran. La barre
// de chargement, elle, s'applique partout (public comme admin).
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        <Suspense fallback={null}>
          <RouteLoadingBar />
        </Suspense>
        {children}
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <RouteLoadingBar />
      </Suspense>
      <FloatingSchoolIcons />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
