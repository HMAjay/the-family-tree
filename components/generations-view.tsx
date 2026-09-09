"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { buildIndex, generationMap, lifespan } from "@/lib/engine";
import { useFamilyStore } from "@/store/family-store";

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const titles = [
  "Great-Great-Grandparents",
  "Great-Grandparents",
  "Grandparents",
  "Parents",
  "You",
  "Children",
  "Grandchildren",
  "Newest leaves",
];

export function GenerationsView() {
  const people = useFamilyStore((s) => s.people);
  const relationships = useFamilyStore((s) => s.relationships);
  const viewerId = useFamilyStore((s) => s.viewerId);
  const index = useMemo(() => buildIndex(people, relationships), [people, relationships]);
  const gens = useMemo(() => generationMap(index), [index]);
  const viewerGen = viewerId ? gens.get(viewerId) ?? 4 : 4;
  const max = people.length ? Math.max(...[...gens.values()]) : 0;
  const [active, setActive] = useState(viewerGen);

  const groups = useMemo(() => {
    const map = new Map<number, typeof people>();
    for (const p of people) {
      const g = gens.get(p.id) ?? 0;
      const list = map.get(g) ?? [];
      list.push(p);
      map.set(g, list);
    }
    return map;
  }, [people, gens]);

  const labelFor = (g: number) => {
    const offset = g - viewerGen + 4;
    return titles[Math.max(0, Math.min(titles.length - 1, offset))] ?? `Generation`;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-28">
      <p className="text-center text-sm tracking-[0.3em] text-gold uppercase">Our Generations</p>
      <h1 className="font-heading mt-2 text-center text-5xl text-maroon">The line, held in the light</h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        Walk from the oldest roots toward the newest leaves. Each generation arrives with a quiet step.
      </p>
      {!people.length && (
        <p className="mt-12 text-center">
          <Link href="/tree" className="text-maroon underline">
            Add the first ancestor
          </Link>{" "}
          to begin the line.
        </p>
      )}
      {people.length > 0 && (
      <>
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {Array.from({ length: max + 1 }, (_, g) => (
          <button
            key={g}
            onClick={() => setActive(g)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              active === g ? "border-maroon bg-maroon text-ivory" : "border-gold/40 hover:bg-secondary"
            }`}
          >
            Generation {roman[g] ?? g + 1}
          </button>
        ))}
      </div>
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mt-12"
      >
        <p className="text-center text-gold">Generation {roman[active] ?? active + 1}</p>
        <h2 className="font-heading text-center text-3xl text-maroon">{labelFor(active)}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(groups.get(active) ?? []).map((p) => (
            <Link
              key={p.id}
              href={`/person/${p.id}`}
              className="gold-border group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5"
            >
              <div className="h-40 overflow-hidden bg-secondary">
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : null}
              </div>
              <div className="p-4">
                <p className="font-heading text-2xl text-maroon">{p.name}</p>
                <p className="text-sm text-muted-foreground">{lifespan(p)}</p>
                <p className="mt-2 text-sm">{p.occupation}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
      </>
      )}
    </div>
  );
}
