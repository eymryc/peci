"use client";

import { useState } from "react";
import { Loader2, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import type { ProjectDetail } from "@/types";

export function ProjectTimelineManager({
  projectId,
  updates,
  onChange,
}: {
  projectId: number;
  updates: ProjectDetail["updates"];
  onChange: () => void;
}) {
  const { token } = useAuth();
  const { push } = useToast();
  const [form, setForm] = useState({ title: "", content: "", date: "" });
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!token || !form.title || !form.content || !form.date) return;
    setSaving(true);
    try {
      await api.post(`/admin/projects/${projectId}/updates`, form, token);
      push("Étape ajoutée.");
      setForm({ title: "", content: "", date: "" });
      onChange();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur.", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (updateId: number) => {
    if (!token || !confirm("Supprimer cette étape ?")) return;
    try {
      await api.delete(`/admin/projects/${projectId}/updates/${updateId}`, token);
      push("Étape supprimée.");
      onChange();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur.", "error");
    }
  };

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <p className="font-semibold text-peci-dark">Timeline / avancement</p>

      {updates.length > 0 && (
        <ol className="mt-4 space-y-4 border-l-2 border-peci-teal/20 pl-5">
          {updates.map((update) => (
            <li key={update.id} className="relative">
              <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full gradient-peci" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-peci-grey">{formatDate(update.date)}</p>
                  <p className="font-medium text-peci-dark">{update.title}</p>
                  <p className="mt-0.5 text-sm text-peci-grey">{update.content}</p>
                </div>
                <button onClick={() => remove(update.id)} className="shrink-0 text-red-500" aria-label="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-5 space-y-3 border-t border-black/5 pt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Titre de l'étape"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <Textarea
          placeholder="Description de l'étape"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <Button
          type="button"
          size="sm"
          disabled={!form.title || !form.content || !form.date || saving}
          onClick={add}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Ajouter l&apos;étape
        </Button>
      </div>
    </div>
  );
}
