"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { ProjectDetail } from "@/types";

export function ProjectGalleryManager({
  projectId,
  images,
  onChange,
}: {
  projectId: number;
  images: ProjectDetail["images"];
  onChange: () => void;
}) {
  const { token } = useAuth();
  const { push } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    if (!token || !file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    if (caption) formData.append("caption", caption);
    try {
      await api.postForm(`/admin/projects/${projectId}/images`, formData, token);
      push("Image ajoutée.");
      setFile(null);
      setCaption("");
      onChange();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur.", "error");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (imageId: number) => {
    if (!token || !confirm("Supprimer cette image ?")) return;
    try {
      await api.delete(`/admin/projects/${projectId}/images/${imageId}`, token);
      push("Image supprimée.");
      onChange();
    } catch (err) {
      push(err instanceof ApiRequestError ? err.message : "Erreur.", "error");
    }
  };

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <p className="font-semibold text-peci-dark">Galerie du projet</p>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl">
              <Image src={image.url} alt={image.caption ?? ""} fill className="object-cover" />
              <button
                onClick={() => remove(image.id)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row sm:items-end">
        <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-peci-teal/40 bg-peci-grey-light px-4 py-3 text-sm text-peci-grey transition-colors hover:bg-peci-teal/5">
          <UploadCloud className="h-4 w-4 text-peci-teal" />
          {file ? file.name : "Choisir une image"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <Input placeholder="Légende (optionnel)" value={caption} onChange={(e) => setCaption(e.target.value)} className="sm:w-56" />
        <Button type="button" size="sm" disabled={!file || uploading} onClick={upload}>
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          Ajouter
        </Button>
      </div>
    </div>
  );
}
