"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { PageLoading } from "@/components/ui/Loading";
import { NewsForm } from "@/components/admin/NewsForm";
import type { NewsArticle } from "@/types";

export default function EditNewsPage() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<NewsArticle>(`/admin/news/${params.id}`, token).then(setArticle);
  }, [token, params.id]);

  if (!article) return <PageLoading />;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-peci-dark">Modifier l&apos;actualité</h1>
      <NewsForm article={article} />
    </div>
  );
}
