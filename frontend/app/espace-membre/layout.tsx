"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, Wallet, Bell, LogOut, Award } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useMember } from "@/lib/use-member";
import { useUnreadNotificationsCount } from "@/lib/use-unread-notifications";
import { PageLoading } from "@/components/ui/Loading";
import { cn } from "@/lib/utils";

const BASE_NAV = [
  { href: "/espace-membre", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/espace-membre/profil", label: "Mon profil", icon: User },
];

const NOTIFICATIONS_NAV = { href: "/espace-membre/notifications", label: "Notifications", icon: Bell };

export default function EspaceMembreLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const { member } = useMember();
  const unreadCount = useUnreadNotificationsCount();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/connexion");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <PageLoading />;
  }

  // Les bénévoles (et autres types sans droit d'adhésion) ne cotisent pas et
  // n'ont pas de carte : la navigation s'adapte au type de membre.
  const type = member?.membership_type;
  const hasFees = !type || type.adhesion_fee > 0 || type.cotisation_fee > 0;
  const hasCertificate = type?.card_eligible === false;

  const nav = [
    ...BASE_NAV,
    ...(hasFees ? [{ href: "/espace-membre/cotisations", label: "Mes cotisations", icon: Wallet }] : []),
    ...(hasCertificate ? [{ href: "/espace-membre/certificat", label: "Mon certificat", icon: Award }] : []),
    NOTIFICATIONS_NAV,
  ];

  return (
    <div className="bg-peci-grey-light">
      <div className="container-peci grid gap-8 py-10 lg:grid-cols-[240px_1fr] lg:py-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-peci-grey">
              Bonjour
            </p>
            <p className="font-display text-lg font-bold text-peci-dark">{user.name}</p>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto rounded-2xl border border-black/5 bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible">
            {nav.map((item) => {
              const active = pathname === item.href;
              const isNotifications = item.href === NOTIFICATIONS_NAV.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                    active ? "gradient-peci text-white" : "text-peci-dark/80 hover:bg-peci-grey-light"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {isNotifications && unreadCount > 0 && (
                    <span
                      className={cn(
                        "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold",
                        active ? "bg-white text-peci-teal" : "bg-peci-green text-white"
                      )}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={() => logout().then(() => router.push("/"))}
              className="flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
