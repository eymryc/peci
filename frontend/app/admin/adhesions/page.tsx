"use client";

import { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import type { Member, Paginated } from "@/types";

export default function AdhesionsPage() {
  const { token } = useAuth();
  const { push } = useToast();
  const [members, setMembers] = useState<Member[] | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = () => {
    if (!token) return;
    api.get<Paginated<Member>>("/admin/memberships/pending", token).then((res) => setMembers(res.items));
  };

  useEffect(load, [token]);

  const approve = async (member: Member) => {
    if (!token) return;
    setBusy(member.id);
    try {
      await api.post(`/admin/memberships/${member.id}/approve`, undefined, token);
      push(`Adhésion de ${member.full_name} approuvée. Carte générée.`);
      load();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur lors de l'approbation.", "error");
    } finally {
      setBusy(null);
    }
  };

  const reject = async (member: Member) => {
    if (!token || !reason.trim()) return;
    setBusy(member.id);
    try {
      await api.post(`/admin/memberships/${member.id}/reject`, { reason }, token);
      push(`Adhésion de ${member.full_name} refusée.`);
      setRejecting(null);
      setReason("");
      load();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur lors du refus.", "error");
    } finally {
      setBusy(null);
    }
  };

  if (!members) return <PageLoading />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Demandes d&apos;adhésion</h1>

      {members.length === 0 ? (
        <p className="text-sm text-peci-grey">Aucune demande en attente.</p>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-peci-dark">{member.full_name}</p>
                  <p className="text-sm text-peci-grey">{member.email} · {member.telephone}</p>
                  <p className="mt-1 text-xs text-peci-grey">
                    Demande soumise le {formatDate(member.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approve(member)} disabled={busy === member.id}>
                    {busy === member.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => setRejecting(rejecting === member.id ? null : member.id)}
                  >
                    <X className="h-4 w-4" />
                    Refuser
                  </Button>
                </div>
              </div>

              {rejecting === member.id && (
                <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
                  <Textarea
                    placeholder="Motif du refus (visible par le candidat)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    disabled={!reason.trim() || busy === member.id}
                    onClick={() => reject(member)}
                  >
                    Confirmer le refus
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
