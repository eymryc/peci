"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap, School, PackageCheck, Users } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export function ImpactSection({
  stats,
  backgroundImage,
}: {
  stats: { children: number; schools: number; kits: number; teachers: number };
  backgroundImage?: string | null;
}) {
  const items = [
    { icon: GraduationCap, value: stats.children, label: "Enfants accompagnés" },
    { icon: School, value: stats.schools, label: "Écoles soutenues" },
    { icon: PackageCheck, value: stats.kits, label: "Kits distribués" },
    { icon: Users, value: stats.teachers, label: "Enseignants accompagnés" },
  ];

  return (
    <section id="impact" className="relative overflow-hidden bg-peci-dark py-24 sm:py-36">
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image src={backgroundImage} alt="" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-peci-dark via-peci-dark/90 to-peci-dark/70" />
        </div>
      )}
      <div className="container-peci relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-peci-green">
            <span className="h-1.5 w-1.5 rounded-full bg-peci-green" />
            Chiffres indicatifs — données de démonstration
          </span>
          <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Notre impact
          </h2>
          <p className="mt-3 text-sm text-white/60">
            Ces chiffres sont des exemples de démonstration, remplaçables depuis l&apos;administration.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-peci-green/40 hover:bg-white/10"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-peci shadow-lg shadow-peci-green/20 transition-transform duration-300 group-hover:scale-110">
                <item.icon className="h-7 w-7 text-white" />
              </div>
              <p className="font-display mt-5 text-4xl font-extrabold text-white">
                <AnimatedCounter value={item.value} suffix="+" />
              </p>
              <p className="mt-2 text-sm text-white/60">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
