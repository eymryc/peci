import Image from "next/image";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { api, ApiRequestError } from "@/lib/api";
import { LinkButton } from "@/components/ui/Button";
import type { ActionItem } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const action = await api.get<ActionItem>(`/actions/${slug}`);
    return { title: action.title, description: action.description ?? undefined };
  } catch {
    return { title: "Action" };
  }
}

export default async function ActionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let action: ActionItem;
  try {
    action = await api.get<ActionItem>(`/actions/${slug}`);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div>
      <section className="relative h-[320px] w-full overflow-hidden bg-peci-dark">
        {action.image_url ? (
          <Image src={action.image_url} alt={action.title} fill className="object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-peci-green/20">
            <BookOpen className="h-24 w-24" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-peci-dark via-peci-dark/50 to-transparent" />
        <div className="container-peci relative flex h-full flex-col justify-end pb-10 text-white">
          {action.category && (
            <p className="text-xs font-semibold uppercase tracking-widest text-peci-green-light">
              {action.category}
            </p>
          )}
          <h1 className="font-display mt-2 max-w-2xl text-3xl font-bold sm:text-4xl">{action.title}</h1>
        </div>
      </section>

      <div className="container-peci max-w-3xl py-14">
        {action.description && (
          <p className="text-lg leading-relaxed text-peci-grey">{action.description}</p>
        )}

        <div className="mt-10 rounded-2xl bg-peci-dark p-8 text-center text-white sm:p-10">
          <p className="font-display text-xl font-bold">Envie de soutenir cette action ?</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <LinkButton href="/devenir-membre">Devenir membre</LinkButton>
            <LinkButton href="/don" variant="outline" className="border-white/40 text-white hover:bg-white hover:text-peci-teal">
              Faire un don
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
