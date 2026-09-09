"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { buildIndex } from "@/lib/engine";
import type { Person, Relationship, RelationshipType } from "@/lib/types";
import { useFamilyStore } from "@/store/family-store";

const BOND_CHOICES: RelationshipType[] = [
  "son",
  "daughter",
  "father",
  "mother",
  "husband",
  "wife",
  "brother",
  "sister",
];

function invertBond(type: RelationshipType, personGender: "female" | "male" | "other"): RelationshipType {
  if (type === "father" || type === "mother") return personGender === "female" ? "daughter" : "son";
  if (type === "son" || type === "daughter") return personGender === "female" ? "mother" : "father";
  if (type === "husband") return "wife";
  if (type === "wife") return "husband";
  if (type === "brother" || type === "sister") return personGender === "female" ? "sister" : "brother";
  return type;
}

function directBond(relationships: Relationship[], a: string, b: string) {
  return relationships.find(
    (r) => (r.personA === a && r.personB === b) || (r.personA === b && r.personB === a)
  );
}

function suggestedBond(fromId: string, toId: string, relationships: Relationship[], people: Person[]): RelationshipType {
  const from = people.find((p) => p.id === fromId);
  const to = people.find((p) => p.id === toId);
  if (!from || !to) return "son";
  const existing = directBond(relationships, fromId, toId);
  if (existing) {
    if (existing.personA === fromId && existing.personB === toId) return existing.type;
    return invertBond(existing.type, from.gender);
  }
  const index = buildIndex(people, relationships);
  if ((index.spousesOf.get(fromId) ?? []).includes(toId)) return from.gender === "female" ? "wife" : "husband";
  if ((index.siblingsOf.get(fromId) ?? []).includes(toId)) return from.gender === "female" ? "sister" : "brother";
  if ((index.parentsOf.get(fromId) ?? []).includes(toId)) return from.gender === "female" ? "daughter" : "son";
  if ((index.childrenOf.get(fromId) ?? []).includes(toId)) return from.gender === "female" ? "mother" : "father";
  return from.gender === "female" ? "daughter" : "son";
}

export function EditBondDialog() {
  const people = useFamilyStore((s) => s.people);
  const relationships = useFamilyStore((s) => s.relationships);
  const pair = useFamilyStore((s) => s.bondEdit);
  const setBondEdit = useFamilyStore((s) => s.setBondEdit);
  const setBond = useFamilyStore((s) => s.setBond);
  const removeBond = useFamilyStore((s) => s.removeBond);
  const [relType, setRelType] = useState<RelationshipType>("son");

  const from = people.find((p) => p.id === pair?.fromId);
  const to = people.find((p) => p.id === pair?.toId);
  const existing = pair ? directBond(relationships, pair.fromId, pair.toId) : undefined;

  useEffect(() => {
    if (!pair) return;
    setRelType(suggestedBond(pair.fromId, pair.toId, relationships, people));
  }, [pair, people, relationships]);

  if (!pair || !from || !to || typeof document === "undefined") return null;

  function close() {
    setBondEdit(null);
  }

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-[#2c1810]/40" aria-label="Close" onClick={close} />
      <div
        role="dialog"
        aria-labelledby="edit-bond-title"
        className="gold-border relative z-10 w-full max-w-md overflow-hidden rounded-3xl border bg-[#fbf6ec] shadow-2xl"
      >
        <div className="border-b border-gold/30 px-6 py-5">
          <h2 id="edit-bond-title" className="font-heading text-3xl text-maroon">
            Edit relation
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You dropped {from.name} onto {to.name}. Choose how they are related.
          </p>
        </div>
        <div className="grid gap-4 px-6 py-5">
          <label className="grid gap-1.5 text-sm">
            <Label>
              {from.name} is the <span className="text-maroon">{relType}</span> of {to.name}
            </Label>
            <select
              className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm"
              value={relType}
              onChange={(e) => setRelType(e.target.value as RelationshipType)}
            >
              {BOND_CHOICES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-gold/30 px-6 py-4">
          {existing ? (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto rounded-full text-muted-foreground"
              onClick={() => {
                removeBond(pair.fromId, pair.toId);
                close();
              }}
            >
              Remove bond
            </Button>
          ) : null}
          <Button type="button" variant="ghost" className="rounded-full" onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-full bg-maroon text-ivory"
            onClick={() => {
              setBond(pair.fromId, pair.toId, relType);
              close();
            }}
          >
            Save relation
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
