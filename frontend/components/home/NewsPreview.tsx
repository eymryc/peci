import { LinkButton } from "@/components/ui/Button";
import { NewsCard } from "@/components/NewsCard";
import type { NewsArticle } from "@/types";

export function NewsPreview({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="container-peci py-24 sm:py-36">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
            À la une
          </span>
          <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">Actualités</h2>
        </div>
        <LinkButton href="/actualites" variant="outline">
          Toutes les actualités
        </LinkButton>
      </div>

      <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
