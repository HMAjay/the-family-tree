"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchFamily } from "@/lib/engine";
import { lifespan } from "@/lib/engine";
import { snapshotFromStore, useFamilyStore } from "@/store/family-store";

export function GlobalSearch({ onNavigate }: { onNavigate?: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const people = useFamilyStore((s) => s.people);
  const memories = useFamilyStore((s) => s.memories);
  const events = useFamilyStore((s) => s.events);

  const results = useMemo(() => {
    if (!q.trim()) return null;
    return searchFamily({ ...snapshotFromStore(), people, memories, events }, q);
  }, [q, people, memories, events]);

  return (
    <div className="relative w-56 lg:w-64">
      <Search className="pointer-events-none absolute top-2 left-2.5 size-4 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search your family…"
        className="rounded-full bg-ivory/70 pl-8"
        aria-label="Search your family"
      />
      {open && results && (
        <div className="gold-border absolute top-10 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-xl border bg-card p-2 shadow-xl">
          {!results.people.length && !results.memories.length && !results.events.length && !results.places.length && (
            <p className="px-2 py-3 text-sm text-muted-foreground">No names, places, or memories match.</p>
          )}
          {results.people.map((p) => (
            <button
              key={p.id}
              className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-secondary"
              onClick={() => {
                setOpen(false);
                setQ("");
                onNavigate?.();
                router.push(`/person/${p.id}`);
              }}
            >
              <span className="font-medium text-maroon">{p.name}</span>
              <span className="text-xs text-muted-foreground">
                {lifespan(p)}
                {p.occupation ? ` • ${p.occupation}` : ""}
                {p.location ? ` • ${p.location}` : ""}
              </span>
            </button>
          ))}
          {results.places.map((place) => (
            <p key={place} className="px-3 py-2 text-sm">
              Place · {place}
            </p>
          ))}
          {results.events.map((e) => (
            <button
              key={e.id}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
                router.push("/heritage");
              }}
            >
              Event · {e.title}
            </button>
          ))}
          {results.memories.map((m) => (
            <button
              key={m.id}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-secondary"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
                router.push("/memories");
              }}
            >
              Memory · {m.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
