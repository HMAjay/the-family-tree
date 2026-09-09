"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";
import {
  buildIndex,
  getChildren,
  getGrandchildren,
  getParents,
  getSiblings,
  getSpouse,
  lifespan,
  personTimeline,
} from "@/lib/engine";
import { useFamilyStore } from "@/store/family-store";

export function PersonProfile({ id }: { id: string }) {
  const people = useFamilyStore((s) => s.people);
  const relationships = useFamilyStore((s) => s.relationships);
  const memories = useFamilyStore((s) => s.memories);
  const events = useFamilyStore((s) => s.events);
  const heritage = useFamilyStore((s) => s.heritage);
  const viewerId = useFamilyStore((s) => s.viewerId);
  const familyName = useFamilyStore((s) => s.familyName);
  const setSelected = useFamilyStore((s) => s.setSelected);
  const person = people.find((p) => p.id === id);
  const index = useMemo(() => buildIndex(people, relationships), [people, relationships]);
  const snapshot = { people, relationships, memories, events, heritage, viewerId, familyName };

  if (!person) {
    return (
      <div className="px-6 py-32 text-center">
        <h1 className="font-heading text-4xl text-maroon">This name is not on the tree</h1>
        <Link href="/tree" className="mt-4 inline-block text-gold underline">
          Return to the family tree
        </Link>
      </div>
    );
  }

  const parents = getParents(index, person.id);
  const spouse = getSpouse(index, person.id);
  const children = getChildren(index, person.id);
  const siblings = getSiblings(index, person.id);
  const grandchildren = getGrandchildren(index, person.id);
  const personMemories = memories.filter((m) => m.associatedPeople.includes(person.id));
  const timeline = personTimeline(person, snapshot);

  return (
    <article className="mx-auto max-w-4xl px-4 py-28">
      <div className="gold-border overflow-hidden rounded-3xl border bg-card">
        <div className="grid md:grid-cols-[280px_1fr]">
          <div className="h-72 bg-secondary md:h-full">
            {person.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={person.photo} alt={person.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="p-8">
            <p className="text-sm tracking-[0.25em] text-gold uppercase">{person.nickname ?? "Family member"}</p>
            <h1 className="font-heading mt-1 text-5xl text-maroon">{person.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{lifespan(person)}</p>
            <p className="mt-6 max-w-prose text-lg italic">“{person.biography}”</p>
            <p className="mt-4 text-sm text-muted-foreground">
              {person.occupation}
              {person.location ? ` · ${person.location}` : ""}
            </p>
            <Link
              href="/tree"
              onClick={() => setSelected(person.id)}
              className="mt-6 inline-flex rounded-full bg-maroon px-4 py-2 text-sm text-ivory"
            >
              Focus on the tree
            </Link>
          </div>
        </div>
      </div>

      <Section title="About">{person.notes || person.biography}</Section>
      <Section title="Family">
        A household of {1 + spouse.length + children.length} in the nearest circle, with {siblings.length} sibling
        {siblings.length === 1 ? "" : "s"} recorded.
      </Section>
      <People title="Parents" list={parents} />
      <People title="Spouse" list={spouse} />
      <People title="Children" list={children} />
      <People title="Siblings" list={siblings} />
      <People title="Grandchildren" list={grandchildren} />

      <Section title="Memories">
        {personMemories.length === 0 && <p>No memories attached yet.</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {personMemories.map((m) => (
            <Link key={m.id} href="/memories" className="overflow-hidden rounded-xl border border-gold/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.media} alt="" className="h-32 w-full object-cover" />
              <p className="p-3 font-medium">{m.title}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Photos">
        <div className="h-56 overflow-hidden rounded-2xl border border-gold/40">
          {person.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={person.photo} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      </Section>

      <Section title="Timeline">
        <ol className="relative border-l border-gold/50 pl-6">
          {timeline.map((item) => (
            <li key={item.year + item.title} className="mb-8">
              <span className="absolute -left-1.5 mt-1.5 size-3 rounded-full bg-gold" />
              <p className="text-sm text-gold">{item.year}</p>
              <p className="font-heading text-2xl text-maroon">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ol>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-12"
    >
      <h2 className="font-heading text-3xl text-maroon">{title}</h2>
      <div className="ornament-line my-4" />
      <div className="text-foreground/90">{children}</div>
    </motion.section>
  );
}

function People({ title, list }: { title: string; list: { id: string; name: string; photo?: string }[] }) {
  return (
    <Section title={title}>
      {list.length === 0 && <p className="text-muted-foreground">None recorded.</p>}
      <div className="flex flex-wrap gap-3">
        {list.map((p) => (
          <Link
            key={p.id}
            href={`/person/${p.id}`}
            className="gold-border flex items-center gap-3 rounded-full border bg-card pr-4"
          >
            <span className="size-10 overflow-hidden rounded-full bg-secondary">
              {p.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photo} alt="" className="h-full w-full object-cover" />
              ) : null}
            </span>
            {p.name}
          </Link>
        ))}
      </div>
    </Section>
  );
}
