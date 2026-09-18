import type { Metadata } from "next";
import { api } from "@/lib/api";
import { NewsCard } from "@/components/NewsCard";
import type { NewsArticle, Paginated } from "@/types";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Suivez les actualités de PECI et de ses actions pour l'éducation en Côte d'Ivoire.",
};

export default async function ActualitesPage() {
  let articles: NewsArticle[] = [];
  try {
    const res = await api.get<Paginated<NewsArticle>>("/news?per_page=24");
    articles = res.items;
  } catch {
    articles = [];
  }

  return (
    <div className="container-peci py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
          À la une
        </span>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">Actualités</h1>
      </div>

      {articles.length === 0 ? (
        <p className="mt-16 text-center text-sm text-peci-grey">Aucune actualité publiée pour le moment.</p>
      ) : (
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
