"use client";

import { useEffect, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Input, Select } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Loading";
import type { Paginated, ResourceFile } from "@/types";

const TYPES: { value: string; label: string }[] = [
  { value: "", label: "Tous les types" },
  { value: "pdf", label: "PDF" },
  { value: "guide", label: "Guides" },
  { value: "fiche", label: "Fiches pédagogiques" },
  { value: "document", label: "Documents" },
  { value: "video", label: "Vidéos" },
  { value: "publication", label: "Publications" },
];

export function ResourcesExplorer() {
  const [items, setItems] = useState<ResourceFile[] | null>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);

    const timeout = setTimeout(() => {
      api
        .get<Paginated<ResourceFile>>(`/resources?${params.toString()}`)
        .then((res) => setItems(res.items))
        .catch(() => setItems([]));
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [q, type]);

  const handleDownload = async (resource: ResourceFile) => {
    try {
      await api.post(`/resources/${resource.id}/download`);
    } catch {
      // le téléchargement se fait malgré tout via l'URL publique
    }
    window.open(resource.file_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-peci-grey" />
          <Input
            placeholder="Rechercher une ressource…"
            className="pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={type} onChange={(e) => setType(e.target.value)} className="sm:w-56">
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items === null &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}

        {items?.length === 0 && (
          <p className="col-span-full text-center text-sm text-peci-grey">Aucune ressource trouvée.</p>
        )}

        {items?.map((resource) => (
          <button
            key={resource.id}
            onClick={() => handleDownload(resource)}
            className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-peci-teal/10 text-peci-teal">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-peci-teal">
                {resource.type}
                {resource.category ? ` · ${resource.category}` : ""}
              </p>
              <p className="mt-1 font-semibold text-peci-dark">{resource.title}</p>
              {resource.description && (
                <p className="mt-1 line-clamp-2 text-sm text-peci-grey">{resource.description}</p>
              )}
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-peci-teal">
                <Download className="h-3.5 w-3.5" /> Télécharger
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
