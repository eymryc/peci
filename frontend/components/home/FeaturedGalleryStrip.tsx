"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { GalleryImageItem } from "@/types";

// Bande de photos "en vedette" — gérée depuis /admin/galerie (case "Vedette"),
// utilisée pour diffuser de vraies photos de terrain au-delà de la page galerie.
export function FeaturedGalleryStrip({ images }: { images: GalleryImageItem[] }) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {images.slice(0, 8).map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: "easeOut" }}
          className={`group relative overflow-hidden rounded-2xl shadow-sm ${index % 5 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}
        >
          <Image
            src={image.url}
            alt={image.caption ?? "Photo PECI"}
            fill
            sizes="(min-width: 640px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {image.caption && (
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/75 to-transparent p-3 text-xs text-white transition-transform duration-300 group-hover:translate-y-0">
              {image.caption}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
