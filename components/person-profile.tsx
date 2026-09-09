"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  buildIndex,
  getChildren,
  getParents,
  getSiblings,
  getSpouse,
  lifespan,
} from "@/lib/engine";
import { displayPortrait } from "@/lib/portraits";
import type { Person } from "@/lib/types";
import { useFamilyStore } from "@/store/family-store";

export function PersonProfile({ id }: { id: string }) {
  const people = useFamilyStore((s) => s.people);
  const relationships = useFamilyStore((s) => s.relationships);
  const setSelected = useFamilyStore((s) => s.setSelected);
  const openEdit = useFamilyStore((s) => s.openEdit);
  const removePerson = useFamilyStore((s) => s.removePerson);
  const router = useRouter();
  const person = people.find((p) => p.id === id);
  const index = useMemo(() => buildIndex(people, relationships), [people, relationships]);

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

  return (
    <article className="mx-auto max-w-4xl px-4 py-28">
      <div className="gold-border overflow-hidden rounded-3xl border bg-card">
        <div className="grid md:grid-cols-[280px_1fr]">
          <div className="h-72 bg-secondary md:h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayPortrait(person)} alt={person.name} className="h-full w-full object-cover object-top" />
          </div>
          <div className="p-8">
            <h1 className="font-heading text-5xl font-bold text-maroon">{person.name}</h1>
            {lifespan(person) ? <p className="mt-2 text-lg text-muted-foreground">{lifespan(person)}</p> : null}
            {person.biography && <p className="mt-6 max-w-prose text-lg italic">“{person.biography}”</p>}
            <p className="mt-4 text-sm text-muted-foreground">
              {[person.occupation, person.location].filter(Boolean).join(" · ")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openEdit(person.id)}
                className="inline-flex rounded-full border border-gold/60 px-4 py-2 text-sm text-maroon"
              >
                Edit details
              </button>
              <Link
                href="/tree"
                onClick={() => setSelected(person.id)}
                className="inline-flex rounded-full bg-maroon px-4 py-2 text-sm text-ivory"
              >
                Back to the tree
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm(`Remove ${person.name} from the tree? Their bonds will be removed too.`)) return;
                  removePerson(person.id);
                  router.push("/tree");
                }}
                className="inline-flex rounded-full border border-red-300 px-4 py-2 text-sm text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <People title="Parents" list={parents} />
      <People title="Spouse" list={spouse} />
      <People title="Children" list={children} />
      <People title="Siblings" list={siblings} />
    </article>
  );
}

function People({ title, list }: { title: string; list: Person[] }) {
  if (!list.length) return null;
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-12">
      <h2 className="font-heading text-3xl font-bold text-maroon">{title}</h2>
      <div className="ornament-line my-4" />
      <div className="flex flex-wrap gap-3">
        {list.map((p) => (
          <Link key={p.id} href={`/person/${p.id}`} className="gold-border flex items-center gap-3 rounded-full border bg-card pr-4">
            <span className="size-10 overflow-hidden rounded-full bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayPortrait(p)} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="font-heading font-bold text-maroon">{p.name}</span>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
