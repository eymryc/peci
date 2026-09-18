import type { Metadata } from "next";
import { api } from "@/lib/api";
import { GalleryGrid, type GalleryImage } from "@/components/GalleryGrid";
import type { GalleryImageItem, NewsArticle, Paginated, Project } from "@/types";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Photos et vidéos des actions de PECI en Côte d'Ivoire.",
};

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function GaleriePage() {
  const [gallery, projects, news] = await Promise.all([
    safe(api.get<GalleryImageItem[]>("/gallery"), [] as GalleryImageItem[]),
    safe(api.get<Paginated<Project>>("/projects?per_page=24"), { items: [], pagination: { current_page: 1, last_page: 1, total: 0 } }),
    safe(api.get<Paginated<NewsArticle>>("/news?per_page=24"), { items: [], pagination: { current_page: 1, last_page: 1, total: 0 } }),
  ]);

  const images: GalleryImage[] = [
    ...gallery.map((g) => ({ url: g.url, alt: g.caption ?? "Photo PECI", category: g.category, caption: g.caption })),
    ...projects.items
      .filter((p) => p.cover_image_url)
      .map((p) => ({ url: p.cover_image_url as string, alt: p.title, category: "actions" as const })),
    ...news.items
      .filter((n) => n.image_url)
      .map((n) => ({ url: n.image_url as string, alt: n.title, category: "evenements" as const })),
  ];

  return (
    <div className="container-peci py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
          En images
        </span>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">Galerie</h1>
      </div>

      <div className="mt-14">
        <GalleryGrid images={images} />
      </div>
    </div>
  );
}
