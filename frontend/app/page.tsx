import { api } from "@/lib/api";
import { Hero } from "@/components/home/Hero";
import { Mission } from "@/components/home/Mission";
import { StatsStrip } from "@/components/home/StatsStrip";
import { ActionsSection } from "@/components/home/ActionsSection";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { RegionsMap } from "@/components/home/RegionsMap";
import { ImpactSection } from "@/components/home/ImpactSection";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsPreview } from "@/components/home/NewsPreview";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { MembershipCTA } from "@/components/home/MembershipCTA";
import { PartnersStrip } from "@/components/home/PartnersStrip";
import { DonateCTA } from "@/components/home/DonateCTA";
import type {
  ActionItem,
  GalleryImageItem,
  NewsArticle,
  Paginated,
  Partner,
  Project,
  RegionStat,
} from "@/types";

type PublicSettings = Record<string, string | number>;

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [settings, actions, projects, news, partners, regions, gallery] = await Promise.all([
    safe(api.get<PublicSettings>("/public/settings"), {} as PublicSettings),
    safe(api.get<ActionItem[]>("/actions"), [] as ActionItem[]),
    safe(api.get<Paginated<Project>>("/projects?per_page=3"), { items: [], pagination: { current_page: 1, last_page: 1, total: 0 } }),
    safe(api.get<Paginated<NewsArticle>>("/news?per_page=3"), { items: [], pagination: { current_page: 1, last_page: 1, total: 0 } }),
    safe(api.get<Partner[]>("/partners"), [] as Partner[]),
    safe(api.get<RegionStat[]>("/public/regions"), [] as RegionStat[]),
    safe(api.get<GalleryImageItem[]>("/gallery"), [] as GalleryImageItem[]),
  ]);

  const galleryImages = gallery
    .map((g) => ({ url: g.url, alt: g.caption ?? "Photo PECI" }))
    .concat(
      projects.items
        .filter((p) => p.cover_image_url)
        .map((p) => ({ url: p.cover_image_url as string, alt: p.title }))
    )
    .concat(
      news.items
        .filter((n) => n.image_url)
        .map((n) => ({ url: n.image_url as string, alt: n.title }))
    );

  return (
    <>
      <Hero
        headline={String(settings.public_hero_headline ?? "Construire aujourd'hui l'éducation de demain.")}
        subheadline={String(
          settings.public_hero_subheadline ??
            "Promouvoir une éducation accessible, inclusive et de qualité pour contribuer à l'avenir de la Côte d'Ivoire."
        )}
        backgroundImage={String(settings.public_home_hero_image ?? "/images/rentree.jpg")}
      />
      <StatsStrip
        stats={[
          { label: "Enfants accompagnés", value: Number(settings.public_stat_children_supported ?? 0) },
          { label: "Écoles soutenues", value: Number(settings.public_stat_schools_supported ?? 0) },
          { label: "Kits distribués", value: Number(settings.public_stat_kits_distributed ?? 0) },
          { label: "Enseignants accompagnés", value: Number(settings.public_stat_teachers_supported ?? 0) },
        ]}
      />
      <Mission
        visionText={String(settings.public_home_vision_text ?? "")}
        missionText={String(settings.public_home_mission_text ?? "")}
        valuesText={String(settings.public_home_values_text ?? "")}
      />
      <ActionsSection actions={actions} />
      <ProjectsPreview projects={projects.items} />
      <RegionsMap regions={regions} />
      <ImpactSection
        stats={{
          children: Number(settings.public_stat_children_supported ?? 0),
          schools: Number(settings.public_stat_schools_supported ?? 0),
          kits: Number(settings.public_stat_kits_distributed ?? 0),
          teachers: Number(settings.public_stat_teachers_supported ?? 0),
        }}
        backgroundImage={gallery.find((g) => g.is_featured)?.url ?? null}
      />
      <Testimonials />
      <NewsPreview articles={news.items} />
      <GalleryPreview images={galleryImages} />
      <MembershipCTA />
      <PartnersStrip partners={partners} />
      <DonateCTA />
    </>
  );
}
