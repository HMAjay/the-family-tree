"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { familyStats } from "@/lib/engine";
import { useFamilyStore } from "@/store/family-store";

export function FamilyStats() {
  const people = useFamilyStore((s) => s.people);
  const relationships = useFamilyStore((s) => s.relationships);
  const memories = useFamilyStore((s) => s.memories);
  const events = useFamilyStore((s) => s.events);
  const heritage = useFamilyStore((s) => s.heritage);
  const viewerId = useFamilyStore((s) => s.viewerId);
  const familyName = useFamilyStore((s) => s.familyName);
  const stats = familyStats({ people, relationships, memories, events, heritage, viewerId, familyName });
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const items = [
    { n: stats.generations, label: "Generations" },
    { n: stats.members, label: "Family Members" },
    { n: stats.branches, label: "Family Branches" },
    { n: stats.cities, label: "Cities" },
    { n: stats.yearsOfHistory, label: "Years of History" },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: i * 0.08, duration: 0.6 }}
          className="gold-border rounded-2xl border bg-card/80 px-4 py-6 text-center"
        >
          <p className="font-heading text-4xl text-maroon">{item.n}</p>
          <p className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
