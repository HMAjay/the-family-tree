"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptyFamily } from "@/lib/empty-family";
import { makePortrait } from "@/lib/portraits";
import type { FamilySnapshot, Person, RelationshipType } from "@/lib/types";

export type NodePosition = { x: number; y: number };

interface FamilyState extends FamilySnapshot {
  hydrated: boolean;
  selectedId: string | null;
  addOpen: boolean;
  bondEdit: { fromId: string; toId: string } | null;
  positions: Record<string, NodePosition>;
  setHydrated: () => void;
  setSelected: (id: string | null) => void;
  setAddOpen: (open: boolean) => void;
  setBondEdit: (pair: { fromId: string; toId: string } | null) => void;
  setNodePosition: (id: string, position: NodePosition) => void;
  setPositions: (positions: Record<string, NodePosition>) => void;
  addPerson: (person: Omit<Person, "id"> & { id?: string }, link?: { relativeId: string; type: RelationshipType }) => string;
  setBond: (personA: string, personB: string, type: RelationshipType) => void;
  removeBond: (personA: string, personB: string) => void;
  startEmpty: () => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      ...emptyFamily(),
      hydrated: false,
      selectedId: null,
      addOpen: false,
      bondEdit: null,
      positions: {},
      setHydrated: () => set({ hydrated: true }),
      setSelected: (id) => set({ selectedId: id }),
      setAddOpen: (open) => set({ addOpen: open }),
      setBondEdit: (pair) => set({ bondEdit: pair }),
      setNodePosition: (id, position) => set({ positions: { ...get().positions, [id]: position } }),
      setPositions: (positions) => set({ positions }),
      addPerson: (person, link) => {
        const id = person.id ?? nanoid(10);
        const next: Person = {
          ...person,
          id,
          photo: person.photo ?? makePortrait(person.name, person.gender),
        };
        const relationships = [...get().relationships];
        if (link) {
          relationships.push({
            id: nanoid(10),
            personA: id,
            personB: link.relativeId,
            type: link.type,
          });
        }
        set({
          people: [...get().people, next],
          relationships,
          selectedId: id,
          viewerId: get().viewerId ?? id,
        });
        return id;
      },
      setBond: (personA, personB, type) => {
        if (personA === personB) return;
        const relationships = get().relationships.filter(
          (r) =>
            !((r.personA === personA && r.personB === personB) || (r.personA === personB && r.personB === personA))
        );
        relationships.push({ id: nanoid(10), personA, personB, type });
        set({ relationships });
      },
      removeBond: (personA, personB) => {
        set({
          relationships: get().relationships.filter(
            (r) =>
              !((r.personA === personA && r.personB === personB) || (r.personA === personB && r.personB === personA))
          ),
        });
      },
      startEmpty: () =>
        set({
          ...emptyFamily("Our Family"),
          selectedId: null,
          positions: {},
          bondEdit: null,
        }),
    }),
    {
      name: "the-family-tree-local",
      partialize: (s) => ({
        people: s.people,
        relationships: s.relationships,
        viewerId: s.viewerId,
        familyName: s.familyName,
        positions: s.positions,
      }),
      skipHydration: true,
    }
  )
);
