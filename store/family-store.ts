"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptyFamily } from "@/lib/empty-family";
import { hasParentLink, parentIdsFromRelationships } from "@/lib/engine";
import { makePortrait } from "@/lib/portraits";
import type { FamilySnapshot, Person, Relationship, RelationshipType } from "@/lib/types";

export type NodePosition = { x: number; y: number };

type TreeSnapshot = FamilySnapshot & {
  positions: Record<string, NodePosition>;
  selectedId: string | null;
};

const HISTORY_LIMIT = 50;

function capture(s: TreeSnapshot): TreeSnapshot {
  return {
    people: s.people,
    relationships: s.relationships,
    memories: s.memories,
    events: s.events,
    heritage: s.heritage,
    viewerId: s.viewerId,
    familyName: s.familyName,
    positions: s.positions,
    selectedId: s.selectedId,
  };
}

interface FamilyState extends FamilySnapshot {
  hydrated: boolean;
  selectedId: string | null;
  addOpen: boolean;
  addForId: string | null;
  addRelType: RelationshipType | null;
  bondEdit: { fromId: string; toId: string } | null;
  positions: Record<string, NodePosition>;
  past: TreeSnapshot[];
  future: TreeSnapshot[];
  setHydrated: () => void;
  setSelected: (id: string | null) => void;
  setAddOpen: (open: boolean) => void;
  openAddRelated: (relativeId: string, relType?: RelationshipType) => void;
  editingId: string | null;
  openEdit: (id: string | null) => void;
  updatePerson: (id: string, patch: Partial<Omit<Person, "id">>) => void;
  setBondEdit: (pair: { fromId: string; toId: string } | null) => void;
  setNodePosition: (id: string, position: NodePosition) => void;
  setPositions: (positions: Record<string, NodePosition>) => void;
  addPerson: (person: Omit<Person, "id"> & { id?: string }, link?: { relativeId: string; type: RelationshipType }) => string;
  setBond: (personA: string, personB: string, type: RelationshipType) => void;
  removeBond: (personA: string, personB: string) => void;
  removePerson: (id: string) => void;
  undo: () => void;
  redo: () => void;
  startEmpty: () => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => {
      const remember = () => {
        const s = get();
        set({
          past: [...s.past, capture(s)].slice(-HISTORY_LIMIT),
          future: [],
        });
      };

      return {
        ...emptyFamily(),
        hydrated: false,
        selectedId: null,
        addOpen: false,
        addForId: null,
        addRelType: null,
        editingId: null,
        bondEdit: null,
        positions: {},
        past: [],
        future: [],
        setHydrated: () => set({ hydrated: true }),
        setSelected: (id) => set({ selectedId: id }),
        setAddOpen: (open) =>
          set(open ? { addOpen: true, addForId: null, addRelType: null } : { addOpen: false, addForId: null, addRelType: null }),
        openAddRelated: (relativeId, relType) =>
          set({
            addOpen: true,
            selectedId: relativeId,
            addForId: relativeId,
            addRelType: relType ?? "son",
          }),
        openEdit: (id) => set({ editingId: id, selectedId: id ?? get().selectedId }),
        updatePerson: (id, patch) => {
          remember();
          set({
            people: get().people.map((p) => (p.id === id ? { ...p, ...patch, id } : p)),
          });
        },
        setBondEdit: (pair) => set({ bondEdit: pair }),
        setNodePosition: (id, position) => {
          remember();
          set({ positions: { ...get().positions, [id]: position } });
        },
        setPositions: (positions) => {
          remember();
          set({ positions });
        },
        addPerson: (person, link) => {
          remember();
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
            if (link.type === "brother" || link.type === "sister") {
              inheritParents(relationships, id, link.relativeId, next.gender);
            }
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
          remember();
          const relationships = get().relationships.filter(
            (r) =>
              !((r.personA === personA && r.personB === personB) || (r.personA === personB && r.personB === personA))
          );
          relationships.push({ id: nanoid(10), personA, personB, type });
          if (type === "brother" || type === "sister") {
            const from = get().people.find((p) => p.id === personA);
            if (from) inheritParents(relationships, personA, personB, from.gender);
          }
          set({ relationships });
        },
        removeBond: (personA, personB) => {
          remember();
          set({
            relationships: get().relationships.filter(
              (r) =>
                !((r.personA === personA && r.personB === personB) || (r.personA === personB && r.personB === personA))
            ),
          });
        },
        removePerson: (id) => {
          remember();
          const { people, relationships, positions, selectedId, viewerId, editingId, addForId, memories, events } = get();
          const nextPeople = people.filter((p) => p.id !== id);
          const nextPos = { ...positions };
          delete nextPos[id];
          set({
            people: nextPeople,
            relationships: relationships.filter((r) => r.personA !== id && r.personB !== id),
            positions: nextPos,
            selectedId: selectedId === id ? null : selectedId,
            viewerId: viewerId === id ? (nextPeople[0]?.id ?? null) : viewerId,
            editingId: editingId === id ? null : editingId,
            addForId: addForId === id ? null : addForId,
            memories: memories.map((m) => ({
              ...m,
              associatedPeople: m.associatedPeople.filter((pid) => pid !== id),
            })),
            events: events.map((e) => ({
              ...e,
              associatedPeople: e.associatedPeople.filter((pid) => pid !== id),
            })),
          });
        },
        undo: () => {
          const { past, future } = get();
          if (!past.length) return;
          const prev = past[past.length - 1];
          set({
            ...prev,
            past: past.slice(0, -1),
            future: [capture(get()), ...future].slice(0, HISTORY_LIMIT),
          });
        },
        redo: () => {
          const { past, future } = get();
          if (!future.length) return;
          const next = future[0];
          set({
            ...next,
            past: [...past, capture(get())].slice(-HISTORY_LIMIT),
            future: future.slice(1),
          });
        },
        startEmpty: () => {
          remember();
          set({
            ...emptyFamily("Our Family"),
            selectedId: null,
            positions: {},
            bondEdit: null,
            addOpen: false,
            addForId: null,
            addRelType: null,
            editingId: null,
          });
        },
      };
    },
    {
      name: "the-family-tree-local",
      partialize: (s) => ({
        people: s.people,
        relationships: s.relationships,
        viewerId: s.viewerId,
        familyName: s.familyName,
        positions: s.positions,
        memories: s.memories,
        events: s.events,
        heritage: s.heritage,
      }),
      skipHydration: true,
    }
  )
);

function inheritParents(
  relationships: Relationship[],
  childId: string,
  siblingId: string,
  childGender: Person["gender"]
) {
  const childType = childGender === "female" ? "daughter" : "son";
  for (const parentId of parentIdsFromRelationships(relationships, siblingId)) {
    if (parentId === childId) continue;
    if (hasParentLink(relationships, parentId, childId)) continue;
    relationships.push({
      id: nanoid(10),
      personA: childId,
      personB: parentId,
      type: childType,
    });
  }
}
