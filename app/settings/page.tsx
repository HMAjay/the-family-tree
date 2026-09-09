"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFamilyStore } from "@/store/family-store";
import { TreeActions } from "@/components/tree-actions";

export default function SettingsPage() {
  const familyName = useFamilyStore((s) => s.familyName);
  const setFamilyName = useFamilyStore((s) => s.setFamilyName);
  const people = useFamilyStore((s) => s.people);
  const viewerId = useFamilyStore((s) => s.viewerId);
  const setViewer = useFamilyStore((s) => s.setViewer);
  const startEmpty = useFamilyStore((s) => s.startEmpty);

  return (
    <div className="mx-auto max-w-xl px-4 py-28">
      <h1 className="font-heading text-5xl text-maroon">Family Settings</h1>
      <p className="mt-3 text-muted-foreground">
        Name your household. Saving and printing the tree require an account.
      </p>
      <label className="mt-8 grid gap-2 text-sm">
        Family name
        <Input value={familyName} onChange={(e) => setFamilyName(e.target.value)} />
      </label>
      <label className="mt-6 grid gap-2 text-sm">
        Viewing as
        <select
          className="h-10 rounded-xl border border-gold/40 bg-card px-3"
          value={viewerId ?? ""}
          onChange={(e) => setViewer(e.target.value || null)}
        >
          <option value="">Not specified</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-8">
        <TreeActions />
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="outline" className="rounded-full" onClick={() => startEmpty()}>
          Clear the tree
        </Button>
      </div>
    </div>
  );
}
