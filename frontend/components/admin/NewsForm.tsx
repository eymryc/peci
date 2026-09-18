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
import type { NewsArticle } from "@/types";

export function NewsForm({ article }: { article?: NewsArticle }) {
  const { token } = useAuth();
  const { push } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({
    title: article?.title ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    author: article?.author ?? "",
    status: article?.status ?? "draft",
    news_category_id: article?.news_category_id ? String(article.news_category_id) : "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") formData.append(key, value);
    });
    if (image) formData.append("image", image);

    try {
      if (article) {
        await api.putForm(`/admin/news/${article.id}`, formData, token);
        push("Actualité mise à jour.");
      } else {
        await api.postForm("/admin/news", formData, token);
        push("Actualité créée avec succès.");
      }
      router.push("/admin/actualites");
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
        <CategorySelect
          endpoint="/admin/news-categories"
          label="Catégorie"
          value={form.news_category_id}
          onChange={(id) => setForm({ ...form, news_category_id: id })}
        />
        <FieldWrapper label="Auteur">
          <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
        </FieldWrapper>
      </div>
      <FieldWrapper label="Extrait" hint="Résumé affiché dans les listes (500 caractères max).">
        <Textarea
          maxLength={500}
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
        />
      </FieldWrapper>
      <FieldWrapper label="Contenu" required>
        <Textarea
          required
          className="min-h-[220px]"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </FieldWrapper>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldWrapper label="Statut">
          <Select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publiée</option>
          </Select>
        </FieldWrapper>
        <FieldWrapper label="Image" hint={article?.image_url ? "Laisser vide pour conserver l'image actuelle." : undefined}>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-peci-teal/40 bg-peci-grey-light px-4 py-3 text-sm text-peci-grey transition-colors hover:bg-peci-teal/5">
            <UploadCloud className="h-5 w-5 text-peci-teal" />
            {image ? image.name : "Choisir une image"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          </label>
        </FieldWrapper>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Enregistrer
      </Button>
    </form>
  );
}
