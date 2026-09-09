"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { buildIndex, findRelationship } from "@/lib/engine";
import { useFamilyStore } from "@/store/family-store";

export function RelatedExplorer() {
  const people = useFamilyStore((s) => s.people);
  const relationships = useFamilyStore((s) => s.relationships);
  const viewerId = useFamilyStore((s) => s.viewerId);
  const setHighlight = useFamilyStore((s) => s.setHighlight);
  const router = useRouter();
  const [a, setA] = useState(viewerId ?? people[0]?.id ?? "");
  const [b, setB] = useState(people.find((p) => p.id === "rahul")?.id ?? people[1]?.id ?? "");
  const index = useMemo(() => buildIndex(people, relationships), [people, relationships]);
  const path = a && b ? findRelationship(index, a, b) : null;
  const sorted = [...people].sort((x, y) => x.name.localeCompare(y.name));

  return (
    <div className="mx-auto max-w-3xl px-4 py-28">
      <p className="text-center text-sm tracking-[0.3em] text-gold uppercase">How Are We Related?</p>
      <h1 className="font-heading mt-2 text-center text-5xl text-maroon">Two names, one golden thread</h1>
      <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground">
        Choose two people. The verified path between them will glow on the tree — never guessed, only walked.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">
          Person A
          <select className="h-10 rounded-xl border border-gold/40 bg-card px-3" value={a} onChange={(e) => setA(e.target.value)}>
            {sorted.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Person B
          <select className="h-10 rounded-xl border border-gold/40 bg-card px-3" value={b} onChange={(e) => setB(e.target.value)}>
            {sorted.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {path && (
        <div className="gold-border mt-10 rounded-2xl border bg-card p-6">
          <p className="whitespace-pre-wrap">{path.summary}</p>
          {path.found && path.steps.length > 0 && (
            <p className="font-heading mt-6 text-2xl text-maroon">
              {index.people.get(a)?.name}
              {path.steps.map((s) => (
                <span key={s.fromId + s.toId}>
                  {" "}
                  → {s.label} → {index.people.get(s.toId)?.name}
                </span>
              ))}
            </p>
          )}
          {path.found && (
            <Button
              className="mt-6 rounded-full bg-maroon text-ivory"
              onClick={() => {
                const ids = [a, ...path.steps.map((s) => s.toId)];
                setHighlight("path", ids, ids);
                router.push("/tree");
              }}
            >
              Glow the path on the tree
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
