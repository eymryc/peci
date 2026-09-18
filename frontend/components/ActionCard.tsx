import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import type { ActionItem } from "@/types";

export function ActionCard({ action }: { action: ActionItem }) {
  return (
    <Link
      href={`/nos-actions/${action.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-peci-green/30 hover:shadow-2xl hover:shadow-peci-green/15"
    >
      <div className="relative h-44 w-full overflow-hidden bg-peci-grey-light">
        {action.image_url ? (
          <Image
            src={action.image_url}
            alt={action.title}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-peci-grey">
            <BookOpen className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-7">
        {action.category && (
          <p className="text-xs font-bold uppercase tracking-wide text-peci-green-dark">{action.category}</p>
        )}
        <h3 className="font-display mt-2 text-xl font-bold text-peci-dark">{action.title}</h3>
        {action.description && (
          <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-peci-grey">{action.description}</p>
        )}
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-peci-teal">
          En savoir plus <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
