"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptyFamily } from "@/lib/empty-family";
import { makePortrait } from "@/lib/portraits";
import type { FamilySnapshot, HighlightMode, Person, RelationshipType } from "@/lib/types";

interface FamilyState extends FamilySnapshot {
  hydrated: boolean;
  selectedId: string | null;
  setHydrated: () => void;
  setSelected: (id: string | null) => void;
  addPerson: (person: Omit<Person, "id"> & { id?: string }, link?: { relativeId: string; type: RelationshipType }) => string;
  startEmpty: () => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      ...emptyFamily(),
      hydrated: false,
      selectedId: null,
      setHydrated: () => set({ hydrated: true }),
      setSelected: (id) => set({ selectedId: id }),
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
      startEmpty: () =>
        set({
          ...emptyFamily("Our Family"),
          selectedId: null,
        }),
    }),
    {
      name: "the-family-tree-local",
      partialize: (s) => ({
        people: s.people,
        relationships: s.relationships,
        viewerId: s.viewerId,
        familyName: s.familyName,
      }),
      skipHydration: true,
    }
  )
);
