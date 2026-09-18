"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  alt: string;
  category: "actions" | "ecoles" | "jeunes" | "evenements" | "benevolat";
  caption?: string | null;
}

const FILTERS: { value: "tout" | GalleryImage["category"]; label: string }[] = [
  { value: "tout", label: "Tout" },
  { value: "actions", label: "Actions" },
  { value: "ecoles", label: "Écoles" },
  { value: "jeunes", label: "Jeunes" },
  { value: "evenements", label: "Événements" },
  { value: "benevolat", label: "Bénévolat" },
];

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("tout");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = filter === "tout" ? images : images.filter((img) => img.category === filter);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
              filter === f.value
                ? "gradient-peci text-white"
                : "bg-peci-grey-light text-peci-grey hover:bg-peci-teal/10"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-peci-grey">
          Aucune photo dans cette catégorie pour le moment.
        </p>
      ) : (
        <div className="mt-10 columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
          {filtered.map((image, index) => (
            <motion.button
              key={`${image.url}-${index}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (index % 6) * 0.06, ease: "easeOut" }}
              onClick={() => setLightboxIndex(index)}
              className="group relative block w-full overflow-hidden rounded-2xl break-inside-avoid"
              style={{ aspectRatio: index % 3 === 0 ? "3/4" : "4/3" }}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-4 pt-8 text-left text-xs text-white transition-transform duration-300 group-hover:translate-y-0">
                  {image.caption}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute right-5 top-5 text-white"
              onClick={() => setLightboxIndex(null)}
              aria-label="Fermer"
            >
              <X className="h-7 w-7" />
            </button>

            {lightboxIndex > 0 && (
              <button
                className="absolute left-5 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i !== null ? i - 1 : i));
                }}
                aria-label="Précédent"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}
            {lightboxIndex < filtered.length - 1 && (
              <button
                className="absolute right-5 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i !== null ? i + 1 : i));
                }}
                aria-label="Suivant"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            <div className="relative h-[80vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
              <Image
                src={filtered[lightboxIndex].url}
                alt={filtered[lightboxIndex].alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
