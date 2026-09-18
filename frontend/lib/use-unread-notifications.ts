"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

// Événement déclenché après qu'une notification a été marquée comme lue,
// pour que le badge (menu + tableau de bord) se mette à jour immédiatement
// sans attendre un changement de page.
export const NOTIFICATIONS_UPDATED_EVENT = "peci:notifications-updated";

export function useUnreadNotificationsCount() {
  const { token } = useAuth();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!token) return;
    api
      .get<{ unread_count: number }>("/member/notifications/unread-count", token)
      .then((res) => setCount(res.unread_count))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
  }, [refresh]);

  return count;
}
