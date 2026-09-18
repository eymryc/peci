import { LinkButton } from "@/components/ui/Button";
import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/types";

export function ProjectsPreview({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="bg-peci-grey-light py-24 sm:py-36">
      <div className="container-peci">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-peci-green" />
              Sur le terrain
            </span>
            <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">
              Nos projets
            </h2>
          </div>
          <LinkButton href="/projets" variant="outline">
            Voir tous les projets
          </LinkButton>
        </div>

        <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
