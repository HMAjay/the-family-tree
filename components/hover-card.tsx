"use client";

import { lifespan } from "@/lib/engine";
import type { Person } from "@/lib/types";

export function HoverCard({
  person,
  x,
  y,
  relation,
}: {
  person: Person;
  x: number;
  y: number;
  relation: string;
  childrenCount?: number;
}) {
  return (
    <div
      className="gold-border pointer-events-none fixed z-50 w-64 overflow-hidden rounded-2xl border bg-card shadow-2xl"
      style={{ left: Math.min(x + 16, window.innerWidth - 280), top: Math.min(y + 16, window.innerHeight - 220) }}
    >
      <div className="h-28 overflow-hidden bg-secondary">
        {person.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.photo} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="p-3">
        <p className="font-heading text-xl text-maroon">{person.name}</p>
        <p className="text-xs text-muted-foreground">{lifespan(person)}</p>
        <p className="mt-2 line-clamp-2 text-sm">{person.biography}</p>
        <p className="mt-2 text-[11px] tracking-wide text-gold uppercase">{relation}</p>
      </div>
    </div>
  );
}
