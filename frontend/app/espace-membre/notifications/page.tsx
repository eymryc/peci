"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { cn, formatDate } from "@/lib/utils";
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/use-unread-notifications";
import type { AppNotification, Paginated } from "@/types";

export default function NotificationsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<Paginated<AppNotification> | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<Paginated<AppNotification>>("/member/notifications", token).then((res) =>
      setData(res)
    );
  }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    await api.post(`/member/notifications/${id}/read`, undefined, token);
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
          }
        : current
    );
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  };

  if (!data) return <PageLoading />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Notifications</h1>

      <div className="space-y-3">
        {data.items.length === 0 ? (
          <div className="rounded-3xl border border-black/5 bg-white p-10 text-center shadow-sm">
            <BellOff className="mx-auto h-8 w-8 text-peci-grey" />
            <p className="mt-4 text-sm text-peci-grey">Vous n&apos;avez aucune notification pour le moment.</p>
          </div>
        ) : (
          data.items.map((notification) => (
            <button
              key={notification.id}
              onClick={() => !notification.read_at && markAsRead(notification.id)}
              className={cn(
                "flex w-full items-start gap-4 rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm transition-colors",
                !notification.read_at && "border-peci-teal/30 bg-peci-teal/5"
              )}
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-peci-teal/10 text-peci-teal">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-peci-dark">{notification.data.title}</p>
                <p className="mt-1 text-sm text-peci-grey">{notification.data.message}</p>
                <p className="mt-2 text-xs text-peci-grey">{formatDate(notification.created_at)}</p>
              </div>
              {!notification.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-peci-teal" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
