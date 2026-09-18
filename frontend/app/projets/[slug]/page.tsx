import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Users, Target, Wallet } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProjectDetail } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const project = await api.get<ProjectDetail>(`/projects/${slug}`);
    return { title: project.title, description: project.description };
  } catch {
    return { title: "Projet" };
  }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let project: ProjectDetail;
  try {
    project = await api.get<ProjectDetail>(`/projects/${slug}`);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div>
      <section className="relative h-[360px] w-full overflow-hidden bg-peci-dark">
        {project.cover_image_url && (
          <Image src={project.cover_image_url} alt={project.title} fill className="object-cover opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-peci-dark via-peci-dark/50 to-transparent" />
        <div className="container-peci relative flex h-full flex-col justify-end pb-10 text-white">
          {project.location && (
            <p className="flex items-center gap-1.5 text-sm text-white/80">
              <MapPin className="h-4 w-4" /> {project.location}
            </p>
          )}
          <h1 className="font-display mt-2 max-w-2xl text-3xl font-bold sm:text-4xl">{project.title}</h1>
        </div>
      </section>

      <div className="container-peci grid gap-10 py-14 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <div>
            <h2 className="font-display text-xl font-bold text-peci-dark">Description</h2>
            <p className="mt-3 leading-relaxed text-peci-grey">{project.description}</p>
          </div>

          {project.objective && (
            <div>
              <h2 className="font-display text-xl font-bold text-peci-dark">Objectif</h2>
              <p className="mt-3 leading-relaxed text-peci-grey">{project.objective}</p>
            </div>
          )}

          {project.images.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-peci-dark">Galerie</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {project.images.map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-xl">
                    <Image src={image.url} alt={image.caption ?? project.title} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {project.updates.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-peci-dark">Avancement du projet</h2>
              <ol className="mt-6 space-y-6 border-l-2 border-peci-teal/20 pl-6">
                {project.updates.map((update, index) => (
                  <li key={index} className="relative">
                    <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full gradient-peci" />
                    <p className="text-xs text-peci-grey">{formatDate(update.date)}</p>
                    <p className="mt-1 font-semibold text-peci-dark">{update.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-peci-grey">{update.content}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {project.results.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-peci-dark">Résultats</h2>
              <ul className="mt-3 list-inside list-disc space-y-1 text-peci-grey">
                {project.results.map((result, index) => (
                  <li key={index}>{result}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <Badge tone="teal">{project.status}</Badge>
            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-peci-grey-light">
              <div className="h-full gradient-peci rounded-full" style={{ width: `${project.progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-peci-grey">{project.progress}% réalisé</p>

            <dl className="mt-6 space-y-4 text-sm">
              {project.beneficiaries !== null && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-peci-teal" />
                  <div>
                    <dt className="text-xs text-peci-grey">Bénéficiaires</dt>
                    <dd className="font-semibold text-peci-dark">{project.beneficiaries}</dd>
                  </div>
                </div>
              )}
              {project.budget !== null && (
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-peci-teal" />
                  <div>
                    <dt className="text-xs text-peci-grey">Budget</dt>
                    <dd className="font-semibold text-peci-dark">{formatCurrency(project.budget)}</dd>
                  </div>
                </div>
              )}
              {project.region && (
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-peci-teal" />
                  <div>
                    <dt className="text-xs text-peci-grey">Région</dt>
                    <dd className="font-semibold text-peci-dark capitalize">{project.region}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
