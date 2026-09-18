"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Save, Home, BarChart3, Info, UploadCloud } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, formatApiErrorMessage } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { FieldWrapper, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { AdminSetting } from "@/types";

type FormState = Record<string, string>;

const SECTIONS: { title: string; icon: typeof Home; keys: { key: string; label: string; type: "text" | "number" | "textarea"; hint?: string }[] }[] = [
  {
    title: "Page d'accueil — Hero",
    icon: Home,
    keys: [
      { key: "public_hero_headline", label: "Titre principal", type: "text" },
      { key: "public_hero_subheadline", label: "Sous-titre", type: "textarea" },
    ],
  },
  {
    title: "Page d'accueil — Notre mission",
    icon: Home,
    keys: [
      { key: "public_home_vision_text", label: "Notre vision", type: "textarea" },
      { key: "public_home_mission_text", label: "Notre mission", type: "textarea" },
      { key: "public_home_values_text", label: "Nos valeurs", type: "textarea" },
    ],
  },
  {
    title: "Chiffres clés (page d'accueil)",
    icon: BarChart3,
    keys: [
      { key: "public_stat_children_supported", label: "Enfants accompagnés", type: "number" },
      { key: "public_stat_schools_supported", label: "Écoles soutenues", type: "number" },
      { key: "public_stat_kits_distributed", label: "Kits distribués", type: "number" },
      { key: "public_stat_teachers_supported", label: "Enseignants accompagnés", type: "number" },
    ],
  },
  {
    title: "Qui sommes-nous",
    icon: Info,
    keys: [
      { key: "public_about_intro_paragraph_1", label: "Paragraphe d'introduction 1", type: "textarea" },
      { key: "public_about_intro_paragraph_2", label: "Paragraphe d'introduction 2", type: "textarea" },
      { key: "public_about_nb_text", label: "Encart mis en avant", type: "textarea" },
      { key: "public_about_objectifs", label: "Nos objectifs", type: "textarea", hint: "Un objectif par ligne." },
      { key: "public_about_missions", label: "Nos missions", type: "textarea", hint: "4 lignes, dans l'ordre : conditions d'apprentissage, réinsertion, créativité, évènements caritatifs." },
      { key: "public_about_activity_text", label: "Nos activités", type: "textarea" },
      { key: "public_about_quote_text", label: "Citation mise en avant", type: "textarea" },
      { key: "public_about_quote_author", label: "Auteur de la citation", type: "text" },
    ],
  },
];

const IMAGE_SETTINGS = [
  { key: "public_home_hero_image", label: "Image de fond — Hero (page d'accueil)" },
  { key: "public_about_hero_image", label: "Image de fond — Qui sommes-nous" },
];

function ImageSettingField({ token, keyName, label, value }: { token: string; keyName: string; label: string; value: string }) {
  const { push } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);

  const onChange = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("key", keyName);
    formData.append("image", file);
    try {
      const result = await api.postForm<{ key: string; value: string }>("/admin/settings/upload-image", formData, token);
      setPreview(result.value);
      push("Image mise à jour avec succès.");
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de l'envoi de l'image."), "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-black/5 p-4">
      <p className="text-sm font-medium text-peci-dark">{label}</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-peci-grey-light">
          {preview && <Image src={preview} alt={label} fill className="object-cover" />}
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-peci-teal/40 bg-peci-grey-light px-4 py-2.5 text-sm text-peci-grey transition-colors hover:bg-peci-teal/5">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin text-peci-teal" /> : <UploadCloud className="h-4 w-4 text-peci-teal" />}
          Changer l&apos;image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
    </div>
  );
}

export default function ParametresPage() {
  const { token, user } = useAuth();
  const { push } = useToast();
  const [settings, setSettings] = useState<AdminSetting[] | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    api.get<AdminSetting[]>("/admin/settings", token).then((data) => {
      setSettings(data);
      setForm(Object.fromEntries(data.map((s) => [s.key, String(s.value ?? "")])));
    });
  }, [token, user?.role]);

  if (user?.role !== "admin") {
    return (
      <div className="rounded-2xl border border-dashed border-peci-teal/30 bg-white p-10 text-center">
        <p className="text-sm text-peci-grey">
          Cette section est réservée aux administrateurs.
        </p>
      </div>
    );
  }

  if (!settings) return <PageLoading />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await api.put(
        "/admin/settings",
        { settings: Object.entries(form).map(([key, value]) => ({ key, value })) },
        token
      );
      push("Paramètres enregistrés avec succès.");
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de l'enregistrement."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-peci-dark">Accueil &amp; Qui sommes-nous</h1>
          <p className="mt-1 text-sm text-peci-grey">
            Textes et images de la page d&apos;accueil et de la page « Qui sommes-nous ». Ces valeurs
            sont utilisées directement sur le site public.
          </p>
        </div>
        <Button type="submit" form="settings-form" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </Button>
      </div>

      <form id="settings-form" onSubmit={onSubmit} className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-peci-teal/10 text-peci-teal">
                <section.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-peci-dark">{section.title}</p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {section.keys.map(({ key, label, type, hint }) => (
                <FieldWrapper
                  key={key}
                  label={label}
                  hint={hint}
                  className={type === "textarea" ? "sm:col-span-2" : undefined}
                >
                  {type === "textarea" ? (
                    <Textarea
                      value={form[key] ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      type={type}
                      min={type === "number" ? 0 : undefined}
                      value={form[key] ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  )}
                </FieldWrapper>
              ))}
            </div>
          </div>
        ))}
      </form>

      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-peci-teal/10 text-peci-teal">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-peci-dark">Images du site</p>
            <p className="text-xs text-peci-grey">Chaque image est envoyée et remplacée immédiatement.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {token &&
            IMAGE_SETTINGS.map((img) => (
              <ImageSettingField key={img.key} token={token} keyName={img.key} label={img.label} value={form[img.key] ?? ""} />
            ))}
        </div>
      </div>
    </div>
  );
}
