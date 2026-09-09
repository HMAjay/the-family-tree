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
}) {
  const left = Math.min(x + 18, typeof window === "undefined" ? x : window.innerWidth - 300);
  const top = Math.min(y + 18, typeof window === "undefined" ? y : window.innerHeight - 260);
  return (
    <div
      className="gold-border pointer-events-none fixed z-50 w-72 overflow-hidden rounded-2xl border bg-card shadow-2xl"
      style={{ left, top }}
    >
      <div className="h-24 overflow-hidden bg-secondary">
        {person.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.photo} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="p-4">
        <p className="font-heading text-xl text-maroon">{person.name}</p>
        <p className="text-xs text-muted-foreground">{lifespan(person)}</p>
        <p className="mt-2 text-sm text-gold">{relation}</p>
        {(person.occupation || person.location) && (
          <p className="mt-1 text-sm text-muted-foreground">
            {[person.occupation, person.location].filter(Boolean).join(" · ")}
          </p>
        )}
        {person.biography && <p className="mt-2 line-clamp-2 text-sm">{person.biography}</p>}
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Click to see how everyone is related to {person.name.split(" ")[0]}. Double-click to open their profile.
        </p>
      </div>
    </div>
  );
}
