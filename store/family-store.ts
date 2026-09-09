"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { emptyFamily } from "@/lib/empty-family";
import { makePortrait } from "@/lib/portraits";
import type {
  FamilyEvent,
  FamilySnapshot,
  HighlightMode,
  MemoryItem,
  Person,
  RelationshipType,
} from "@/lib/types";

interface FamilyState extends FamilySnapshot {
  selectedId: string | null;
  highlightMode: HighlightMode;
  highlightIds: string[];
  pathIds: string[];
  setSelected: (id: string | null) => void;
  setHighlight: (mode: HighlightMode, ids: string[], pathIds?: string[]) => void;
  addPerson: (person: Omit<Person, "id"> & { id?: string }, link?: { relativeId: string; type: RelationshipType }) => string;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  removePerson: (id: string) => void;
  addRelationship: (personA: string, type: RelationshipType, personB: string) => void;
  addMemory: (memory: Omit<MemoryItem, "id">) => void;
  addEvent: (event: Omit<FamilyEvent, "id">) => void;
  updateHeritage: (patch: Partial<FamilySnapshot["heritage"]>) => void;
  setViewer: (id: string | null) => void;
  setFamilyName: (name: string) => void;
  startEmpty: () => void;
  importSnapshot: (snap: FamilySnapshot) => void;
}

const emptyUi = {
  selectedId: null as string | null,
  highlightMode: "none" as HighlightMode,
  highlightIds: [] as string[],
  pathIds: [] as string[],
};

export const useFamilyStore = create<FamilyState>()((set, get) => ({
  ...emptyFamily(),
  ...emptyUi,
  setSelected: (id) => set({ selectedId: id }),
  setHighlight: (mode, ids, pathIds = []) => set({ highlightMode: mode, highlightIds: ids, pathIds }),
  addPerson: (person, link) => {
    const id = person.id ?? nanoid(10);
    const photo = person.photo ?? makePortrait(person.name, person.gender);
    const next: Person = { ...person, id, photo };
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
  updatePerson: (id, patch) =>
    set({
      people: get().people.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }),
  removePerson: (id) =>
    set({
      people: get().people.filter((p) => p.id !== id),
      relationships: get().relationships.filter((r) => r.personA !== id && r.personB !== id),
      selectedId: get().selectedId === id ? null : get().selectedId,
    }),
  addRelationship: (personA, type, personB) =>
    set({
      relationships: [...get().relationships, { id: nanoid(10), personA, personB, type }],
    }),
  addMemory: (memory) => set({ memories: [...get().memories, { ...memory, id: nanoid(10) }] }),
  addEvent: (event) => set({ events: [...get().events, { ...event, id: nanoid(10) }] }),
  updateHeritage: (patch) => set({ heritage: { ...get().heritage, ...patch } }),
  setViewer: (id) => set({ viewerId: id }),
  setFamilyName: (name) => set({ familyName: name }),
  startEmpty: () =>
    set({
      ...emptyFamily("Our Family"),
      ...emptyUi,
    }),
  importSnapshot: (snap) => set({ ...snap }),
}));

export function snapshotFromStore(): FamilySnapshot {
  const s = useFamilyStore.getState();
  return {
    people: s.people,
    relationships: s.relationships,
    memories: s.memories,
    events: s.events,
    heritage: s.heritage,
    viewerId: s.viewerId,
    familyName: s.familyName,
  };
}
