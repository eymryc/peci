"use client";

import { motion } from "framer-motion";
import { Target, Eye, HeartHandshake } from "lucide-react";

export function Mission({
  visionText,
  missionText,
  valuesText,
}: {
  visionText: string;
  missionText: string;
  valuesText: string;
}) {
  const cards = [
    { icon: Eye, title: "Notre vision", text: visionText },
    { icon: Target, title: "Notre mission", text: missionText },
    { icon: HeartHandshake, title: "Nos valeurs", text: valuesText },
  ];

  return (
    <section className="container-peci relative py-24 sm:py-36">
      <div className="animate-float-slow absolute -left-20 top-10 -z-10 h-64 w-64 rounded-full bg-peci-green/10 blur-3xl" />

      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-peci-green-dark">
          <span className="h-1.5 w-1.5 rounded-full bg-peci-green" />
          Notre raison d&apos;être
        </span>
        <h2 className="font-display mt-4 text-4xl font-extrabold tracking-tight text-peci-dark sm:text-5xl">
          Notre mission
        </h2>
      </div>

      <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group rounded-3xl border border-black/5 bg-white p-9 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-peci-green/30 hover:shadow-2xl hover:shadow-peci-green/10"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-peci text-white shadow-md shadow-peci-green/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <card.icon className="h-7 w-7" />
            </div>
            <h3 className="font-display mt-6 text-xl font-bold text-peci-dark">{card.title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-peci-grey">{card.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
