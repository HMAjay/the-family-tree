import { generationMap, yearOf, type GraphIndex } from "./engine";
import type { Person } from "./types";

export interface LaidOutNode {
  id: string;
  person: Person;
  x: number;
  y: number;
  generation: number;
}

const NODE_W = 210;
const NODE_H = 250;
const GAP_X = 176;
const GAP_Y = 188;
const STEP = NODE_W + GAP_X;

function personKey(p: Person) {
  return `${String(yearOf(p) ?? 9999).padStart(4, "0")}-${p.name}`;
}

function sortCouple(members: Person[]): Person[] {
  const unique: Person[] = [];
  const seen = new Set<string>();
  for (const p of members) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    unique.push(p);
  }
  const male = unique.filter((p) => p.gender === "male").sort((a, b) => personKey(a).localeCompare(personKey(b)));
  const female = unique.filter((p) => p.gender === "female").sort((a, b) => personKey(a).localeCompare(personKey(b)));
  const other = unique.filter((p) => p.gender === "other").sort((a, b) => personKey(a).localeCompare(personKey(b)));
  if (male.length && female.length) return [...male, ...female, ...other];
  return unique.sort((a, b) => personKey(a).localeCompare(personKey(b)));
}

function familyUnit(index: GraphIndex, person: Person, gen: number, gens: Map<string, number>): Person[] {
  const ids = new Set<string>([person.id]);
  const visit = [...ids];
  while (visit.length) {
    const id = visit.pop()!;
    for (const sid of index.spousesOf.get(id) ?? []) {
      if (ids.has(sid)) continue;
      if ((gens.get(sid) ?? gen) !== gen) continue;
      if (!index.people.has(sid)) continue;
      ids.add(sid);
      visit.push(sid);
    }
  }
  return sortCouple([...ids].map((id) => index.people.get(id)).filter((p): p is Person => Boolean(p)));
}

function childUnitsOf(index: GraphIndex, unit: Person[], unitGen: number, gens: Map<string, number>): Person[][] {
  const kids: Person[] = [];
  const seenKid = new Set<string>();
  for (const p of unit) {
    for (const cid of index.childrenOf.get(p.id) ?? []) {
      if (seenKid.has(cid)) continue;
      const child = index.people.get(cid);
      if (!child) continue;
      if ((gens.get(cid) ?? unitGen + 1) < unitGen + 1) continue;
      seenKid.add(cid);
      kids.push(child);
    }
  }
  kids.sort((a, b) => personKey(a).localeCompare(personKey(b)));

  const units: Person[][] = [];
  const used = new Set<string>();
  for (const kid of kids) {
    if (used.has(kid.id)) continue;
    const next = familyUnit(index, kid, gens.get(kid.id) ?? unitGen + 1, gens);
    for (const m of next) used.add(m.id);
    units.push(next);
  }
  return units;
}

function layoutUnit(
  index: GraphIndex,
  unit: Person[],
  gen: number,
  y: number,
  gens: Map<string, number>
): { width: number; pos: Map<string, { x: number; y: number }> } {
  const couple = sortCouple(unit);
  const coupleWidth = (couple.length - 1) * STEP + NODE_W;
  const kids = childUnitsOf(index, couple, gen, gens);
  const pos = new Map<string, { x: number; y: number }>();

  if (!kids.length) {
    couple.forEach((p, i) => pos.set(p.id, { x: i * STEP, y }));
    return { width: coupleWidth, pos };
  }

  const packed: { width: number; pos: Map<string, { x: number; y: number }>; offset: number }[] = [];
  let cursor = 0;
  for (const cu of kids) {
    const childGen = gens.get(cu[0].id) ?? gen + 1;
    const sub = layoutUnit(index, cu, childGen, y + NODE_H + GAP_Y, gens);
    packed.push({ ...sub, offset: cursor });
    cursor += sub.width + GAP_X;
  }
  const childrenWidth = cursor - GAP_X;
  const width = Math.max(coupleWidth, childrenWidth);
  const coupleStart = (width - coupleWidth) / 2;
  const childrenStart = (width - childrenWidth) / 2;

  couple.forEach((p, i) => pos.set(p.id, { x: coupleStart + i * STEP, y }));
  for (const block of packed) {
    for (const [id, p] of block.pos) {
      pos.set(id, { x: p.x + childrenStart + block.offset, y: p.y });
    }
  }
  return { width, pos };
}

export function layoutTree(index: GraphIndex): LaidOutNode[] {
  if (!index.people.size) return [];
  const gens = generationMap(index);
  const placed = new Set<string>();
  const merged = new Map<string, { x: number; y: number }>();

  const roots = [...index.people.values()]
    .filter((p) => (index.parentsOf.get(p.id) ?? []).length === 0)
    .sort((a, b) => personKey(a).localeCompare(personKey(b)));

  const rootUnits: Person[][] = [];
  const seenRoot = new Set<string>();
  for (const r of roots) {
    if (seenRoot.has(r.id)) continue;
    const unit = familyUnit(index, r, gens.get(r.id) ?? 0, gens);
    for (const m of unit) seenRoot.add(m.id);
    rootUnits.push(unit);
  }

  let xOff = 0;
  for (const unit of rootUnits) {
    const gen = Math.min(...unit.map((p) => gens.get(p.id) ?? 0));
    const sub = layoutUnit(index, unit, gen, gen * (NODE_H + GAP_Y), gens);
    for (const [id, p] of sub.pos) {
      merged.set(id, { x: p.x + xOff, y: p.y });
      placed.add(id);
    }
    xOff += sub.width + GAP_X * 1.25;
  }

  const leftovers = [...index.people.values()].filter((p) => !placed.has(p.id));
  for (const p of leftovers.sort((a, b) => personKey(a).localeCompare(personKey(b)))) {
    if (placed.has(p.id)) continue;
    const gen = gens.get(p.id) ?? 0;
    const unit = familyUnit(index, p, gen, gens);
    const sub = layoutUnit(index, unit, gen, gen * (NODE_H + GAP_Y), gens);
    for (const [id, pos] of sub.pos) {
      merged.set(id, { x: pos.x + xOff, y: pos.y });
      placed.add(id);
    }
    xOff += sub.width + GAP_X;
  }

  const xs = [...merged.values()].map((p) => p.x);
  const minX = Math.min(...xs, 0);
  const nodes: LaidOutNode[] = [];
  for (const person of index.people.values()) {
    const p = merged.get(person.id) ?? { x: 0, y: (gens.get(person.id) ?? 0) * (NODE_H + GAP_Y) };
    nodes.push({
      id: person.id,
      person,
      x: p.x - minX,
      y: p.y,
      generation: gens.get(person.id) ?? 0,
    });
  }
  return nodes;
}

export const treeMetrics = { NODE_W, NODE_H, GAP_X, GAP_Y };

export function sortByBirth(people: Person[]) {
  return [...people].sort((a, b) => (yearOf(a) ?? 0) - (yearOf(b) ?? 0));
}
