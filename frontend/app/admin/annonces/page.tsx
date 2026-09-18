"use client";

import { useEffect, useState } from "react";
import { Loader2, Megaphone, Send, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, formatApiErrorMessage } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { Input, Textarea, FieldWrapper } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import type { Announcement } from "@/types";

export default function AdminAnnouncementsPage() {
  const { token } = useAuth();
  const { push } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendSms, setSendSms] = useState(false);
  const [sending, setSending] = useState(false);

  const load = () => {
    if (!token) return;
    api.get<{ items: Announcement[] }>("/admin/announcements", token).then((res) => setAnnouncements(res.items));
  };

  useEffect(load, [token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || sending) return;
    setSending(true);
    try {
      await api.post("/admin/announcements", { title, message, send_sms: sendSms }, token);
      push("Annonce envoyée à tous les membres.");
      setTitle("");
      setMessage("");
      setSendSms(false);
      load();
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de l'envoi."), "error");
    } finally {
      setSending(false);
    }
  };

  if (!announcements) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-peci-dark">Annonces</h1>
        <p className="mt-1 text-sm text-peci-grey">
          Informez tous les membres (réunions, événements, actions...) depuis leur espace membre —
          notification en ligne, et par SMS si vous cochez l&apos;option.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <FieldWrapper label="Titre" required>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Réunion générale" />
        </FieldWrapper>
        <FieldWrapper label="Message" required>
          <Textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Détails de la réunion, de l'événement ou de l'action..."
          />
        </FieldWrapper>
        <label className="flex items-center gap-2 text-sm text-peci-dark">
          <input
            type="checkbox"
            checked={sendSms}
            onChange={(e) => setSendSms(e.target.checked)}
            className="h-4 w-4 rounded border-black/20 text-peci-teal focus:ring-peci-teal"
          />
          Envoyer aussi par SMS
        </label>
        <Button type="submit" disabled={sending}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Envoyer à tous les membres
        </Button>
      </form>

      <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
        <p className="border-b border-black/5 px-6 py-4 font-semibold text-peci-dark">Historique</p>
        {announcements.length === 0 ? (
          <div className="p-10 text-center">
            <Megaphone className="mx-auto h-8 w-8 text-peci-grey" />
            <p className="mt-3 text-sm text-peci-grey">Aucune annonce envoyée pour le moment.</p>
          </div>
        ) : (
          <ul className="divide-y divide-black/5">
            {announcements.map((a) => (
              <li key={a.id} className="px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-peci-dark">{a.title}</p>
                  <span className="flex items-center gap-3 text-xs text-peci-grey">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {a.recipients_count}
                    </span>
                    {a.sent_sms && <span className="rounded-full bg-peci-green/15 px-2 py-0.5 text-peci-green-dark">SMS</span>}
                    {formatDate(a.created_at)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-peci-grey">{a.message}</p>
                {a.sent_by && <p className="mt-1 text-xs text-peci-grey">Par {a.sent_by}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
