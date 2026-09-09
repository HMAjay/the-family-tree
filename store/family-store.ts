"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptyFamily } from "@/lib/empty-family";
import { hasParentLink, parentIdsFromRelationships } from "@/lib/engine";
import type {
  FamilySnapshot,
  NodePosition,
  Person,
  Relationship,
  RelationshipType,
  SavedTreePayload,
} from "@/lib/types";

export type { NodePosition } from "@/lib/types";

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
  setFamilyName: (name: string) => void;
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
  applySavedTreeMigration: () => void;
  layoutRevision: number;
  remoteTreeId: string | null;
  loadSavedTree: (id: string, payload: SavedTreePayload) => void;
  exportPayload: () => SavedTreePayload;
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
        layoutRevision: 0,
        remoteTreeId: null,
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
        setFamilyName: (name) => set({ familyName: name }),
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
            customPhoto: Boolean(person.photo) || Boolean(person.customPhoto),
            photo: person.photo,
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
            layoutRevision: 5,
            remoteTreeId: null,
            selectedId: null,
            positions: {},
            bondEdit: null,
            addOpen: false,
            addForId: null,
            addRelType: null,
            editingId: null,
          });
        },
        applySavedTreeMigration: () => {
          if (get().layoutRevision >= 5) return;
          set({
            layoutRevision: 5,
            positions: {},
            people: get().people.map((p) =>
              p.customPhoto
                ? p
                : {
                    ...p,
                    photo: undefined,
                    customPhoto: false,
                  }
            ),
          });
        },
        loadSavedTree: (id, payload) => {
          set({
            familyName: payload.familyName,
            people: payload.people,
            relationships: payload.relationships,
            memories: payload.memories,
            events: payload.events,
            heritage: payload.heritage,
            viewerId: payload.viewerId,
            positions: payload.positions ?? {},
            layoutRevision: payload.layoutRevision ?? 5,
            remoteTreeId: id,
            selectedId: null,
            past: [],
            future: [],
            bondEdit: null,
            addOpen: false,
            addForId: null,
            addRelType: null,
            editingId: null,
          });
        },
        exportPayload: () => {
          const s = get();
          return {
            familyName: s.familyName,
            people: s.people,
            relationships: s.relationships,
            memories: s.memories,
            events: s.events,
            heritage: s.heritage,
            viewerId: s.viewerId,
            positions: s.positions,
            layoutRevision: s.layoutRevision,
          };
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
        layoutRevision: s.layoutRevision,
        remoteTreeId: s.remoteTreeId,
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
