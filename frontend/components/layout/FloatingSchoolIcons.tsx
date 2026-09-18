"use client";

import { motion } from "framer-motion";
import { Backpack, BookOpen, NotebookText, PencilLine } from "lucide-react";

// Petites icônes scolaires qui flottent et tournent doucement sur le fond
// vert clair du site, à la manière des fleurs/mots animés du menu plein
// écran (voir MenuOverlay) — purement décoratif, jamais interactif.
const ICONS: {
  Icon: typeof PencilLine;
  top: string;
  left?: string;
  right?: string;
  size: string;
  duration: number;
  delay: number;
  spinDuration: number;
}[] = [
  { Icon: PencilLine, top: "8%", left: "5%", size: "h-8 w-8", duration: 9, delay: 0, spinDuration: 22 },
  { Icon: Backpack, top: "22%", right: "7%", size: "h-9 w-9", duration: 11, delay: 0.8, spinDuration: 26 },
  { Icon: NotebookText, top: "42%", left: "3%", size: "h-7 w-7", duration: 8, delay: 1.4, spinDuration: 20 },
  { Icon: BookOpen, top: "60%", right: "4%", size: "h-8 w-8", duration: 10, delay: 0.4, spinDuration: 24 },
  { Icon: PencilLine, top: "76%", left: "8%", size: "h-7 w-7", duration: 9.5, delay: 1.9, spinDuration: 18 },
  { Icon: NotebookText, top: "90%", right: "10%", size: "h-7 w-7", duration: 8.5, delay: 1.1, spinDuration: 21 },
  { Icon: BookOpen, top: "12%", right: "22%", size: "h-7 w-7", duration: 10.5, delay: 2.2, spinDuration: 25 },
  { Icon: Backpack, top: "68%", left: "18%", size: "h-7 w-7", duration: 9, delay: 0.6, spinDuration: 19 },
];

export function FloatingSchoolIcons() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden lg:block">
      {ICONS.map(({ Icon, top, left, right, size, duration, delay, spinDuration }, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -22, 0] }}
          transition={{
            opacity: { duration: 1, delay },
            y: { duration, repeat: Infinity, ease: "easeInOut", delay },
          }}
          className="absolute text-peci-green/40"
          style={{ top, left, right }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: spinDuration, repeat: Infinity, ease: "linear" }}
          >
            <Icon className={size} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
