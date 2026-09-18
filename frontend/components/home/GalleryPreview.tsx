import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";

export function GalleryPreview({ images }: { images: { url: string; alt: string }[] }) {
  if (images.length === 0) return null;

  return (
    <section className="bg-peci-grey-light py-24 sm:py-36">
      <div className="container-peci">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
            En images
          </span>
          <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">Galerie</h2>
        </div>

        <div className="mt-12 columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative overflow-hidden rounded-2xl break-inside-avoid"
              style={{ aspectRatio: index % 3 === 0 ? "3/4" : "4/3" }}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <LinkButton href="/galerie" variant="outline">
            Voir plus de photos et vidéos
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
