"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Member } from "@/types";

export function useMember() {
  const { token } = useAuth();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    api
      .get<Member>("/member/profile", token)
      .then((data) => {
        if (!cancelled) setMember(data);
      })
      .catch(() => {
        if (!cancelled) setError("Impossible de charger votre profil.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  return { member, loading, error, reload: () => setReloadKey((k) => k + 1) };
}
