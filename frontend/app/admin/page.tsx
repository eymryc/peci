"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ClipboardCheck,
  Users,
  UserCheck,
  IdCard,
  FolderKanban,
  HandHeart,
  Heart,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, formatApiErrorMessage } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { DashboardData } from "@/types";

const CHART_COLORS = ["#17A79D", "#8EC44C", "#128077", "#6FA332", "#66736F"];

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(new Date(Number(year), Number(m) - 1));
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    api
      .get<DashboardData>("/admin/dashboard", token)
      .then((d) => {
        setData(d);
        setError(null);
      })
      .catch((err) => setError(formatApiErrorMessage(err, "Impossible de charger le tableau de bord.")));
  }, [token, reloadKey]);

  if (error) {
    return (
      <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-10 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="mt-4 text-sm font-semibold text-peci-teal hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!data) return <PageLoading />;

  const { stats } = data;

  const cards = [
    { label: "Demandes en attente", value: stats.members.pending, icon: ClipboardCheck, href: "/admin/adhesions" },
    { label: "Membres actifs", value: stats.members.approved, icon: UserCheck, href: "/admin/membres?status=approved" },
    { label: "Total membres", value: stats.members.total, icon: Users, href: "/admin/membres" },
    { label: "Cartes générées", value: stats.cards_generated, icon: IdCard, href: "/admin/membres" },
    { label: "Projets en cours", value: stats.projects.ongoing, icon: FolderKanban, href: "/admin/projets" },
    { label: "Bénévoles", value: stats.volunteers, icon: HandHeart, href: "/admin/membres" },
    { label: "Dons reçus", value: formatCurrency(stats.donations.total_amount), icon: Heart, href: "#" },
    { label: "Paiements en attente", value: stats.payments.pending_count, icon: Wallet, href: "/admin/paiements" },
  ];

  const membersGrowth = data.members_growth.map((d) => ({ ...d, label: formatMonth(d.month) }));
  const paymentsGrowth = data.payments_growth.map((d) => ({ ...d, label: formatMonth(d.month) }));

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Tableau de bord</h1>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <card.icon className="h-6 w-6 text-peci-teal" />
            <p className="font-display mt-4 text-2xl font-bold text-peci-dark">
              {typeof card.value === "number" ? formatNumber(card.value) : card.value}
            </p>
            <p className="mt-1 text-sm text-peci-grey">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="font-semibold text-peci-dark">Nouveaux membres (6 derniers mois)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={membersGrowth}>
                <defs>
                  <linearGradient id="membersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#17A79D" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#17A79D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f1" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#17A79D" strokeWidth={2} fill="url(#membersGradient)" name="Membres" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="font-semibold text-peci-dark">Cotisations encaissées (6 derniers mois)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentsGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f1" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#8EC44C" radius={[6, 6, 0, 0]} name="Montant" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="font-semibold text-peci-dark">Projets par statut</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.projects_by_status}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.projects_by_status.map((entry, index) => (
                    <Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-peci-grey">
            {data.projects_by_status.map((entry, index) => (
              <span key={entry.status} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                {entry.status} ({entry.count})
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="font-semibold text-peci-dark">Membres par type d&apos;adhésion</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.members_by_region} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f1" />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <YAxis dataKey="type" type="category" tickLine={false} axisLine={false} fontSize={12} width={110} />
                <Tooltip />
                <Bar dataKey="count" fill="#17A79D" radius={[0, 6, 6, 0]} name="Membres" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
