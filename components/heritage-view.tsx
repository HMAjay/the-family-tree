"use client";

import { motion } from "framer-motion";
import { useFamilyStore } from "@/store/family-store";

export function HeritageView() {
  const heritage = useFamilyStore((s) => s.heritage);
  const events = useFamilyStore((s) => s.events);
  const familyName = useFamilyStore((s) => s.familyName);
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="mx-auto max-w-4xl px-4 py-28">
      <p className="text-center text-sm tracking-[0.3em] text-gold uppercase">Our Heritage</p>
      <h1 className="font-heading mt-2 text-center text-5xl text-maroon">{familyName}</h1>
      <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed">{heritage.origins}</p>
      <p className="mt-3 text-center text-gold">Native place · {heritage.nativePlace || "Not yet recorded"}</p>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <Block title="Family traditions" items={heritage.traditions} />
        <Block title="Languages spoken" items={heritage.languages} />
        <Block title="Festivals celebrated" items={heritage.festivals} />
        <Block title="Family occupations" items={heritage.occupations} />
        <Block title="Important values" items={heritage.values} />
      </div>

      <h2 className="font-heading mt-20 text-4xl text-maroon">Ancestral stories</h2>
      <div className="ornament-line my-4" />
      <div className="space-y-8">
        {heritage.stories.map((s) => (
          <article key={s.title} className="gold-border rounded-2xl border bg-card/80 p-6">
            <h3 className="font-heading text-2xl text-maroon">{s.title}</h3>
            <p className="mt-3 leading-relaxed">{s.body}</p>
          </article>
        ))}
      </div>

      <h2 className="font-heading mt-20 text-4xl text-maroon">Family recipes</h2>
      <div className="ornament-line my-4" />
      <div className="space-y-6">
        {heritage.recipes.map((r) => (
          <article key={r.name}>
            <h3 className="font-heading text-2xl">{r.name}</h3>
            <p className="text-muted-foreground">{r.story}</p>
          </article>
        ))}
      </div>

      <h2 className="font-heading mt-20 text-4xl text-maroon">Family timeline</h2>
      <div className="ornament-line my-4" />
      <ol className="relative border-l-2 border-gold/60 pl-8">
        {sorted.map((ev, i) => (
          <motion.li
            key={ev.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="mb-10"
          >
            <span className="absolute -left-[9px] mt-1 size-4 rounded-full border-2 border-maroon bg-gold" />
            <p className="text-sm tracking-widest text-gold uppercase">{ev.date.slice(0, 4)}</p>
            <h3 className="font-heading text-3xl text-maroon">{ev.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{ev.location}</p>
            <p className="mt-2">{ev.description}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="gold-border rounded-2xl border bg-card/70 p-6">
      <h2 className="font-heading text-2xl text-maroon">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {items.length ? items.map((t) => <li key={t}>· {t}</li>) : <li>Not yet recorded.</li>}
      </ul>
    </section>
  );
}
