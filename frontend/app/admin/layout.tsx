"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  Wallet,
  Settings,
  LogOut,
  FolderKanban,
  Newspaper,
  BookOpen,
  Handshake,
  Sparkles,
  MapPin,
  Images,
  Coins,
  Megaphone,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { PageLoading } from "@/components/ui/Loading";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  adminOnly?: boolean;
}

// Regroupé et ordonné pour suivre le site public : contenu des pages (de
// l'accueil aux partenaires), puis adhésions/membres.
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Vue d'ensemble",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Contenu du site",
    items: [
      { href: "/admin/parametres", label: "Accueil & Qui sommes-nous", icon: Settings, adminOnly: true },
      { href: "/admin/actions", label: "Actions", icon: Sparkles },
      { href: "/admin/projets", label: "Projets", icon: FolderKanban },
      { href: "/admin/actualites", label: "Actualités", icon: Newspaper },
      { href: "/admin/ressources", label: "Ressources", icon: BookOpen },
      { href: "/admin/galerie", label: "Galerie", icon: Images },
      { href: "/admin/interventions", label: "Interventions", icon: MapPin },
      { href: "/admin/partenaires", label: "Partenaires", icon: Handshake },
    ],
  },
  {
    label: "Adhésions & membres",
    items: [
      { href: "/admin/adhesions", label: "Demandes d'adhésion", icon: ClipboardCheck },
      { href: "/admin/membres", label: "Membres", icon: Users },
      { href: "/admin/paiements", label: "Paiements", icon: Wallet },
      { href: "/admin/cotisations", label: "Cotisations & types", icon: Coins },
      { href: "/admin/annonces", label: "Annonces", icon: Megaphone },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user || !["admin", "staff"].includes(user.role)) {
      router.replace("/connexion");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || !["admin", "staff"].includes(user.role)) {
    return <PageLoading />;
  }

  return (
    <div className="flex min-h-screen bg-peci-grey-light">
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-black/5 bg-peci-dark p-5 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/logo.jpg" alt="PECI" width={36} height={36} className="rounded-full" />
          <div>
            <p className="font-display font-bold text-white">PECI</p>
            <p className="text-[10px] uppercase tracking-wide text-white/50">Administration</p>
          </div>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-6">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((item) => !item.adminOnly || user.role === "admin");
            if (items.length === 0) return null;

            return (
              <div key={group.label}>
                <p className="px-3.5 text-[11px] font-semibold uppercase tracking-wider text-white/35">
                  {group.label}
                </p>
                <div className="mt-2 flex flex-col gap-1">
                  {items.map((item) => {
                    const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                          active ? "gradient-peci text-white" : "text-white/70 hover:bg-white/5"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <button
          onClick={() => logout().then(() => router.push("/"))}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-4 lg:px-10">
          <p className="text-sm text-peci-grey">
            Connecté en tant que <span className="font-semibold text-peci-dark">{user.name}</span> ·{" "}
            <span className="uppercase text-peci-teal">{user.role}</span>
          </p>
        </header>
        <main className="p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
