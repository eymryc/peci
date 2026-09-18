"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, UploadCloud } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { FieldWrapper, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { Partner } from "@/types";

export function PartnerForm({ partner }: { partner?: Partner }) {
  const { token } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    name: partner?.name ?? "",
    website: partner?.website ?? "",
    type: partner?.type ?? "",
    description: partner?.description ?? "",
    order: partner?.order ?? 0,
    is_active: partner?.is_active ?? true,
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) =>
      formData.append(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value))
    );
    if (logo) formData.append("logo", logo);

    try {
      if (partner) {
        await api.putForm(`/admin/partners/${partner.id}`, formData, token);
        push("Partenaire mis à jour.");
      } else {
        await api.postForm("/admin/partners", formData, token);
        push("Partenaire créé avec succès.");
      }
      router.push("/admin/partenaires");
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur lors de l'enregistrement.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <FieldWrapper label="Nom" required>
        <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </FieldWrapper>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper label="Site web">
          <Input
            type="url"
            placeholder="https://…"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </FieldWrapper>
        <FieldWrapper label="Type" hint="ex. institutionnel, ONG, entreprise">
          <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Description">
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FieldWrapper>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper label="Ordre d'affichage">
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
        </FieldWrapper>
        <FieldWrapper label="Statut">
          <label className="flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-black/20 text-peci-teal"
            />
            <span className="text-sm text-peci-dark">Partenaire actif (visible sur le site)</span>
          </label>
        </FieldWrapper>
      </div>
      <FieldWrapper label="Logo" hint={partner?.logo_url ? "Laisser vide pour conserver le logo actuel." : undefined}>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-peci-teal/40 bg-peci-grey-light px-4 py-4 text-sm text-peci-grey transition-colors hover:bg-peci-teal/5">
          <UploadCloud className="h-5 w-5 text-peci-teal" />
          {logo ? logo.name : "Choisir un logo"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} />
        </label>
      </FieldWrapper>

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </Button>
    </form>
  );
}
