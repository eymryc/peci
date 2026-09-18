import Image from "next/image";
import { notFound } from "next/navigation";
import { api, ApiRequestError } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { NewsArticle } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const article = await api.get<NewsArticle>(`/news/${slug}`);
    return { title: article.title, description: article.excerpt ?? undefined };
  } catch {
    return { title: "Actualité" };
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let article: NewsArticle;
  try {
    article = await api.get<NewsArticle>(`/news/${slug}`);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }

  return (
    <article className="container-peci max-w-3xl py-20 sm:py-28">
      {article.category && (
        <p className="text-xs font-semibold uppercase tracking-wide text-peci-teal">{article.category}</p>
      )}
      <h1 className="font-display mt-2 text-3xl font-bold text-peci-dark sm:text-4xl">{article.title}</h1>
      <p className="mt-3 text-sm text-peci-grey">
        {formatDate(article.published_at)}
        {article.author ? ` · ${article.author}` : ""}
      </p>

      {article.image_url && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl">
          <Image src={article.image_url} alt={article.title} fill className="object-cover" />
        </div>
      )}

      <div className="mt-10 max-w-none whitespace-pre-line text-base leading-relaxed text-peci-dark">
        {article.content}
      </div>
    </article>
  );
}
