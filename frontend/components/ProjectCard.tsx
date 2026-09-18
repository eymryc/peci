import Image from "next/image";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/types";

const STATUS_LABEL: Record<Project["status"], string> = {
  planned: "Planifié",
  ongoing: "En cours",
  completed: "Terminé",
  suspended: "Suspendu",
};

const STATUS_TONE: Record<Project["status"], "teal" | "green" | "grey" | "amber"> = {
  planned: "grey",
  ongoing: "teal",
  completed: "green",
  suspended: "amber",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projets/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-peci-green/30 hover:shadow-2xl hover:shadow-peci-green/15"
    >
      <div className="relative h-48 w-full overflow-hidden bg-peci-grey-light">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-peci-grey">PECI</div>
        )}
        <div className="absolute left-3 top-3">
          <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-display text-xl font-bold text-peci-dark">{project.title}</h3>
        {project.location && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-peci-grey">
            <MapPin className="h-3.5 w-3.5" /> {project.location}
          </p>
        )}
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-peci-grey">
          {project.description}
        </p>

        <div className="mt-5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-peci-grey-light">
            <div
              className="h-full gradient-peci rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-peci-grey">
            <span>{project.progress}% réalisé</span>
            {project.beneficiaries !== null && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {project.beneficiaries} bénéficiaires
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
