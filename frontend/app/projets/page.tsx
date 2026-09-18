import type { Metadata } from "next";
import { api } from "@/lib/api";
import { ProjectCard } from "@/components/ProjectCard";
import type { Paginated, Project } from "@/types";

export const metadata: Metadata = {
  title: "Nos projets",
  description: "Découvrez les projets menés par PECI sur le terrain en Côte d'Ivoire.",
};

export default async function ProjetsPage() {
  let projects: Project[] = [];
  try {
    const res = await api.get<Paginated<Project>>("/projects?per_page=24");
    projects = res.items;
  } catch {
    projects = [];
  }

  return (
    <div className="container-peci py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
          Sur le terrain
        </span>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">Nos projets</h1>
      </div>

      {projects.length === 0 ? (
        <p className="mt-16 text-center text-sm text-peci-grey">Aucun projet publié pour le moment.</p>
      ) : (
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
