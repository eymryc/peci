import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { NewsArticle } from "@/types";

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/actualites/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-peci-green/30 hover:shadow-2xl hover:shadow-peci-green/15"
    >
      <div className="relative h-44 w-full overflow-hidden bg-peci-grey-light">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-peci-grey">PECI</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-7">
        {article.category && (
          <p className="text-xs font-bold uppercase tracking-wide text-peci-green-dark">{article.category}</p>
        )}
        <h3 className="font-display mt-2 line-clamp-2 text-lg font-bold text-peci-dark">{article.title}</h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-peci-grey">{article.excerpt}</p>
        )}
        <p className="mt-4 text-xs text-peci-grey">{formatDate(article.published_at)}</p>
      </div>
    </Link>
  );
}
