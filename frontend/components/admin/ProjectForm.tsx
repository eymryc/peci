"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, UploadCloud } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { FieldWrapper, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { ProjectDetail, RegionStat } from "@/types";

export function ProjectForm({ project }: { project?: ProjectDetail }) {
  const { token } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const [form, setForm] = useState({
    title: project?.title ?? "",
    description: project?.description ?? "",
    objective: project?.objective ?? "",
    location: project?.location ?? "",
    region: project?.region ?? "",
    budget: project?.budget ?? "",
    beneficiaries: project?.beneficiaries ?? "",
    progress: project?.progress ?? 0,
    status: project?.status ?? "planned",
    starts_at: project?.starts_at ?? "",
    ends_at: project?.ends_at ?? "",
    partners: project?.partners?.join("\n") ?? "",
    results: project?.results?.join("\n") ?? "",
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<RegionStat[]>("/public/regions").then(setRegions);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "partners" || key === "results") {
        const list = String(value)
          .split("\n")
          .map((v) => v.trim())
          .filter(Boolean);
        list.forEach((v) => formData.append(`${key}[]`, v));
        return;
      }
      if (value !== "") formData.append(key, String(value));
    });
    if (coverImage) formData.append("cover_image", coverImage);

    try {
      if (project) {
        await api.putForm(`/admin/projects/${project.id}`, formData, token);
        push("Projet mis à jour.");
        router.refresh();
      } else {
        const created = await api.postForm<ProjectDetail>("/admin/projects", formData, token);
        push("Projet créé avec succès.");
        router.push(`/admin/projets/${created.id}`);
      }
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur lors de l'enregistrement.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <FieldWrapper label="Titre" required>
        <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </FieldWrapper>

      <FieldWrapper label="Description" required>
        <Textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </FieldWrapper>

      <FieldWrapper label="Objectif">
        <Textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
      </FieldWrapper>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper label="Localisation" hint="ex. Abidjan, Cocody">
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Région">
          <Select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
            <option value="">Sélectionner</option>
            {regions.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))}
          </Select>
        </FieldWrapper>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <FieldWrapper label="Budget (FCFA)">
          <Input type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Bénéficiaires">
          <Input
            type="number"
            min={0}
            value={form.beneficiaries}
            onChange={(e) => setForm({ ...form, beneficiaries: e.target.value })}
          />
        </FieldWrapper>
        <FieldWrapper label="Progression (%)">
          <Input
            type="number"
            min={0}
            max={100}
            value={form.progress}
            onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
          />
        </FieldWrapper>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <FieldWrapper label="Statut">
          <Select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as "planned" | "ongoing" | "completed" | "suspended" })
            }
          >
            <option value="planned">Planifié</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminé</option>
            <option value="suspended">Suspendu</option>
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Date de début">
          <Input type="date" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Date de fin">
          <Input type="date" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
        </FieldWrapper>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper label="Partenaires" hint="Un nom par ligne">
          <Textarea value={form.partners} onChange={(e) => setForm({ ...form, partners: e.target.value })} />
        </FieldWrapper>
        <FieldWrapper label="Résultats" hint="Un résultat par ligne">
          <Textarea value={form.results} onChange={(e) => setForm({ ...form, results: e.target.value })} />
        </FieldWrapper>
      </div>

      <FieldWrapper label="Image de couverture" hint={project?.cover_image_url ? "Laisser vide pour conserver l'image actuelle." : undefined}>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-peci-teal/40 bg-peci-grey-light px-4 py-4 text-sm text-peci-grey transition-colors hover:bg-peci-teal/5">
          <UploadCloud className="h-5 w-5 text-peci-teal" />
          {coverImage ? coverImage.name : "Choisir une image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
        </label>
      </FieldWrapper>

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </Button>
    </form>
  );
}
