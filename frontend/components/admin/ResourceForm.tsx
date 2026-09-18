"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, UploadCloud } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { FieldWrapper, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CategorySelect } from "@/components/admin/CategorySelect";
import type { ResourceFile } from "@/types";

const TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "guide", label: "Guide" },
  { value: "fiche", label: "Fiche pédagogique" },
  { value: "document", label: "Document" },
  { value: "video", label: "Vidéo" },
  { value: "publication", label: "Publication" },
];

export function ResourceForm({ resource }: { resource?: ResourceFile }) {
  const { token } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    title: resource?.title ?? "",
    type: resource?.type ?? "document",
    description: resource?.description ?? "",
    resource_category_id: resource?.resource_category_id ? String(resource.resource_category_id) : "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") formData.append(key, value);
    });
    if (file) formData.append("file", file);

    try {
      if (resource) {
        await api.putForm(`/admin/resources/${resource.id}`, formData, token);
        push("Ressource mise à jour.");
      } else {
        await api.postForm("/admin/resources", formData, token);
        push("Ressource créée avec succès.");
      }
      router.push("/admin/ressources");
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
        <FieldWrapper label="Type" required>
          <Select
            required
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as ResourceFile["type"] })}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </FieldWrapper>
        <CategorySelect
          endpoint="/admin/resource-categories"
          label="Catégorie"
          value={form.resource_category_id}
          onChange={(id) => setForm({ ...form, resource_category_id: id })}
        />
      </div>
      <FieldWrapper label="Description">
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FieldWrapper>
      <FieldWrapper
        label="Fichier"
        required={!resource}
        hint={resource ? "Laisser vide pour conserver le fichier actuel." : "PDF, image, vidéo… 20 Mo maximum."}
      >
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-peci-teal/40 bg-peci-grey-light px-4 py-4 text-sm text-peci-grey transition-colors hover:bg-peci-teal/5">
          <UploadCloud className="h-5 w-5 text-peci-teal" />
          {file ? file.name : "Choisir un fichier"}
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      </FieldWrapper>

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </Button>
    </form>
  );
}
