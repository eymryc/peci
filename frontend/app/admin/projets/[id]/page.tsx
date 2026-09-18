"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectGalleryManager } from "@/components/admin/ProjectGalleryManager";
import { ProjectTimelineManager } from "@/components/admin/ProjectTimelineManager";
import type { ProjectDetail } from "@/types";

export default function EditProjectPage() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);

  const load = () => {
    if (!token) return;
    api.get<ProjectDetail>(`/admin/projects/${params.id}`, token).then(setProject);
  };

  useEffect(load, [token, params.id]);

  if (!project) return <PageLoading />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Modifier le projet</h1>
      <ProjectForm project={project} />
      <ProjectGalleryManager projectId={project.id} images={project.images} onChange={load} />
      <ProjectTimelineManager projectId={project.id} updates={project.updates} onChange={load} />
    </div>
  );
}
