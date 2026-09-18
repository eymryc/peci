"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, UploadCloud } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { FieldWrapper, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { ActionItem } from "@/types";

export function ActionForm({ action }: { action?: ActionItem }) {
  const { token } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    title: action?.title ?? "",
    category: action?.category ?? "",
    description: action?.description ?? "",
    icon: action?.icon ?? "",
    order: action?.order ?? 0,
  });
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, String(value)));
    if (image) formData.append("image", image);

    try {
      if (action) {
        await api.putForm(`/admin/actions/${action.id}`, formData, token);
        push("Action mise à jour.");
      } else {
        await api.postForm("/admin/actions", formData, token);
        push("Action créée avec succès.");
      }
      router.push("/admin/actions");
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur lors de l'enregistrement.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <FieldWrapper label="Titre" required>
        <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FieldWrapper>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper label="Catégorie">
          <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Ordre d'affichage">
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Description">
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FieldWrapper>
      <FieldWrapper label="Icône (nom lucide-react)" hint="ex. graduation-cap, school, users…">
        <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
      </FieldWrapper>
      <FieldWrapper label="Image" hint={action?.image_url ? "Laisser vide pour conserver l'image actuelle." : undefined}>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-peci-teal/40 bg-peci-grey-light px-4 py-4 text-sm text-peci-grey transition-colors hover:bg-peci-teal/5">
          <UploadCloud className="h-5 w-5 text-peci-teal" />
          {image ? image.name : "Choisir une image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        </label>
      </FieldWrapper>

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </Button>
    </form>
  );
}
