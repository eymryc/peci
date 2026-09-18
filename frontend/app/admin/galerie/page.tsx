"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, Star, Trash2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, formatApiErrorMessage } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { FieldWrapper, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { GalleryImageItem } from "@/types";

const CATEGORIES: { value: GalleryImageItem["category"]; label: string }[] = [
  { value: "actions", label: "Actions" },
  { value: "ecoles", label: "Écoles" },
  { value: "jeunes", label: "Jeunes" },
  { value: "evenements", label: "Événements" },
  { value: "benevolat", label: "Bénévolat" },
];

export default function AdminGaleriePage() {
  const { token } = useAuth();
  const { push } = useToast();
  const [images, setImages] = useState<GalleryImageItem[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<GalleryImageItem["category"]>("actions");

  const load = () => {
    if (!token) return;
    api.get<GalleryImageItem[]>("/admin/gallery", token).then(setImages);
  };

  useEffect(load, [token]);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);
    if (caption.trim()) formData.append("caption", caption.trim());

    try {
      await api.postForm("/admin/gallery", formData, token);
      push("Image ajoutée à la galerie.");
      setFile(null);
      setCaption("");
      load();
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de l'envoi de l'image."), "error");
    } finally {
      setUploading(false);
    }
  };

  const toggleFeatured = async (image: GalleryImageItem) => {
    if (!token) return;
    setBusyId(image.id);
    try {
      await api.put(`/admin/gallery/${image.id}`, { category: image.category, is_featured: !image.is_featured }, token);
      load();
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (image: GalleryImageItem) => {
    if (!token) return;
    setBusyId(image.id);
    try {
      await api.put(`/admin/gallery/${image.id}`, { category: image.category, is_active: !image.is_active }, token);
      load();
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur."), "error");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (image: GalleryImageItem) => {
    if (!token || !confirm("Supprimer cette image de la galerie ?")) return;
    setBusyId(image.id);
    try {
      await api.delete(`/admin/gallery/${image.id}`, token);
      push("Image supprimée.");
      load();
    } catch (err) {
      push(formatApiErrorMessage(err, "Erreur lors de la suppression."), "error");
    } finally {
      setBusyId(null);
    }
  };

  if (!images) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-peci-dark">Galerie</h1>
        <p className="mt-1 text-sm text-peci-grey">
          Photos affichées sur <code className="text-xs">/galerie</code> et sur la page
          d&apos;accueil. Les images marquées « en vedette » apparaissent aussi sur la page « Qui
          sommes-nous » et dans d&apos;autres sections du site.
        </p>
      </div>

      <form onSubmit={upload} className="grid gap-4 rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:grid-cols-[1.2fr_1fr_1fr_auto]">
        <FieldWrapper label="Image" hint="JPG, PNG ou WebP, 8 Mo maximum.">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-peci-teal/40 bg-peci-grey-light px-4 py-3 text-sm text-peci-grey transition-colors hover:bg-peci-teal/5">
            <UploadCloud className="h-5 w-5 shrink-0 text-peci-teal" />
            <span className="truncate">{file ? file.name : "Choisir une photo"}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </FieldWrapper>
        <FieldWrapper label="Légende (optionnel)">
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Ex. Distribution de kits scolaires" />
        </FieldWrapper>
        <FieldWrapper label="Catégorie">
          <Select value={category} onChange={(e) => setCategory(e.target.value as GalleryImageItem["category"])}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </FieldWrapper>
        <div className="flex items-end">
          <Button type="submit" disabled={uploading || !file} className="w-full sm:w-auto">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Ajouter
          </Button>
        </div>
      </form>

      {images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-peci-teal/30 bg-white p-10 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-peci-grey" />
          <p className="mt-3 text-sm text-peci-grey">Aucune image pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="relative aspect-square">
                <Image src={image.url} alt={image.caption ?? "Photo galerie"} fill className="object-cover" />
                {!image.is_active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold uppercase text-white">
                    Masquée
                  </div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-xs font-medium text-peci-dark">{image.caption || "—"}</p>
                <p className="text-[11px] uppercase tracking-wide text-peci-grey">
                  {CATEGORIES.find((c) => c.value === image.category)?.label}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => toggleFeatured(image)}
                    disabled={busyId === image.id}
                    title="Mettre en vedette (visible ailleurs sur le site)"
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      image.is_featured ? "bg-peci-green/15 text-peci-green-dark" : "bg-peci-grey-light text-peci-grey hover:bg-peci-teal/10"
                    )}
                  >
                    <Star className={cn("h-3 w-3", image.is_featured && "fill-current")} />
                    Vedette
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(image)}
                      disabled={busyId === image.id}
                      className="text-[11px] font-medium text-peci-teal hover:underline"
                    >
                      {image.is_active ? "Masquer" : "Afficher"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(image)}
                      disabled={busyId === image.id}
                      aria-label="Supprimer"
                      className="text-red-500 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
