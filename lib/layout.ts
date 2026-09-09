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
const ROW = NODE_H + GAP_Y;

type Block = {
  pos: Map<string, { x: number; y: number }>;
  width: number;
  apex: number;
};

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

function isSibling(index: GraphIndex, a: string, b: string) {
  return (index.siblingsOf.get(a) ?? []).includes(b);
}

/** True spouses only: not siblings, not a sibling's husband or wife. */
export function realSpousesOf(index: GraphIndex, id: string): string[] {
  const sibs = index.siblingsOf.get(id) ?? [];
  return (index.spousesOf.get(id) ?? []).filter((sid) => {
    if (sid === id) return false;
    if (sibs.includes(sid) || isSibling(index, id, sid)) return false;
    for (const sib of sibs) {
      if ((index.spousesOf.get(sib) ?? []).includes(sid)) return false;
    }
    return Boolean(index.people.get(sid));
  });
}

export function coupleOf(index: GraphIndex, person: Person, gens: Map<string, number>): Person[] {
  const gen = gens.get(person.id) ?? 0;
  const ids = new Set<string>([person.id, ...realSpousesOf(index, person.id)]);
  const members = [...ids]
    .map((id) => index.people.get(id))
    .filter((p): p is Person => {
      if (!p) return false;
      return (gens.get(p.id) ?? gen) === gen;
    });
  return sortCouple(members);
}

function childUnitsOf(index: GraphIndex, unit: Person[], unitGen: number, gens: Map<string, number>): Person[][] {
  const inUnit = new Set(unit.map((p) => p.id));
  const kids: Person[] = [];
  const seenKid = new Set<string>();
  for (const p of unit) {
    for (const cid of index.childrenOf.get(p.id) ?? []) {
      if (seenKid.has(cid) || inUnit.has(cid)) continue;
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
    const next = coupleOf(index, kid, gens);
    for (const m of next) used.add(m.id);
    units.push(next);
  }
  return units;
}

function bbox(pos: Map<string, { x: number; y: number }>) {
  let minX = Infinity;
  let maxX = -Infinity;
  for (const p of pos.values()) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x + NODE_W);
  }
  if (!Number.isFinite(minX)) return { minX: 0, maxX: NODE_W };
  return { minX, maxX };
}

function normalize(block: Block): Block {
  const { minX, maxX } = bbox(block.pos);
  const pos = new Map<string, { x: number; y: number }>();
  for (const [id, p] of block.pos) pos.set(id, { x: p.x - minX, y: p.y });
  return { pos, width: maxX - minX, apex: block.apex - minX };
}

function coupleApex(members: Person[], pos: Map<string, { x: number; y: number }>) {
  const first = pos.get(members[0].id);
  const last = pos.get(members[members.length - 1].id);
  if (!first || !last) return NODE_W / 2;
  return (first.x + last.x + NODE_W) / 2;
}

function packBlocks(blocks: Block[]): Block {
  if (!blocks.length) return { pos: new Map(), width: 0, apex: 0 };
  const parts = blocks.map(normalize);
  if (parts.length === 1) return parts[0];

  let spacing = STEP;
  for (let i = 0; i < parts.length - 1; i++) {
    const need = parts[i].width - parts[i].apex + GAP_X + parts[i + 1].apex;
    spacing = Math.max(spacing, need);
  }

  const firstApex = parts[0].apex;
  const pos = new Map<string, { x: number; y: number }>();
  for (let i = 0; i < parts.length; i++) {
    const dx = firstApex + i * spacing - parts[i].apex;
    for (const [id, p] of parts[i].pos) pos.set(id, { x: p.x + dx, y: p.y });
  }
  const lastApex = firstApex + (parts.length - 1) * spacing;
  return normalize({ pos, width: 0, apex: (firstApex + lastApex) / 2 });
}

function layoutUnit(index: GraphIndex, unit: Person[], gen: number, gens: Map<string, number>): Block {
  const couple = sortCouple(unit);
  const y = gen * ROW;
  const kids = childUnitsOf(index, couple, gen, gens);
  const coupleWidth = (couple.length - 1) * STEP + NODE_W;

  if (!kids.length) {
    const pos = new Map<string, { x: number; y: number }>();
    couple.forEach((p, i) => pos.set(p.id, { x: i * STEP, y }));
    return { pos, width: coupleWidth, apex: coupleWidth / 2 };
  }

  const childBlocks = kids.map((cu) => {
    const childGen = Math.max(...cu.map((p) => gens.get(p.id) ?? gen + 1));
    return layoutUnit(index, cu, childGen, gens);
  });
  const packed = packBlocks(childBlocks);
  const width = Math.max(coupleWidth, packed.width);
  const childrenStart = (width - packed.width) / 2;
  const coupleStart = (width - coupleWidth) / 2;

  const pos = new Map<string, { x: number; y: number }>();
  couple.forEach((p, i) => pos.set(p.id, { x: coupleStart + i * STEP, y }));
  for (const [id, p] of packed.pos) pos.set(id, { x: p.x + childrenStart, y: p.y });

  const apex = coupleApex(couple, pos);
  return { pos, width, apex };
}

function unitsLinked(index: GraphIndex, a: Person[], b: Person[]) {
  const idsB = new Set(b.map((p) => p.id));
  for (const p of a) {
    for (const s of index.siblingsOf.get(p.id) ?? []) if (idsB.has(s)) return true;
    for (const s of index.coBrothersOf.get(p.id) ?? []) if (idsB.has(s)) return true;
    for (const s of realSpousesOf(index, p.id)) {
      for (const sib of index.siblingsOf.get(s) ?? []) if (idsB.has(sib)) return true;
    }
  }
  return false;
}

function clusterUnits(index: GraphIndex, units: Person[][]): Person[][][] {
  const n = units.length;
  const parent = units.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const union = (i: number, j: number) => {
    const a = find(i);
    const b = find(j);
    if (a !== b) parent[a] = b;
  };
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (unitsLinked(index, units[i], units[j])) union(i, j);
    }
  }
  const groups = new Map<number, Person[][]>();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    const list = groups.get(r) ?? [];
    list.push(units[i]);
    groups.set(r, list);
  }
  return [...groups.values()].map((group) =>
    group.sort((a, b) => personKey(a[0]).localeCompare(personKey(b[0])))
  );
}

function collectUnits(index: GraphIndex, people: Person[], gens: Map<string, number>, placed: Set<string>): Person[][] {
  const units: Person[][] = [];
  const seen = new Set<string>();
  for (const p of people) {
    if (placed.has(p.id) || seen.has(p.id)) continue;
    const unit = coupleOf(index, p, gens);
    if (unit.some((m) => placed.has(m.id))) continue;
    for (const m of unit) seen.add(m.id);
    units.push(unit);
  }
  return units;
}

export function layoutTree(index: GraphIndex): LaidOutNode[] {
  if (!index.people.size) return [];
  const gens = generationMap(index);
  const placed = new Set<string>();
  const merged = new Map<string, { x: number; y: number }>();

  const roots = [...index.people.values()]
    .filter((p) => (index.parentsOf.get(p.id) ?? []).filter((id) => index.people.has(id)).length === 0)
    .sort((a, b) => personKey(a).localeCompare(personKey(b)));

  const rootUnits = collectUnits(index, roots, gens, placed);
  const clusters = clusterUnits(index, rootUnits);

  let xOff = 0;
  const placeCluster = (units: Person[][]) => {
    const blocks = units.map((unit) => {
      const gen = Math.min(...unit.map((p) => gens.get(p.id) ?? 0));
      return layoutUnit(index, unit, gen, gens);
    });
    const packed = packBlocks(blocks);
    for (const [id, p] of packed.pos) {
      merged.set(id, { x: p.x + xOff, y: p.y });
      placed.add(id);
    }
    xOff += packed.width + GAP_X * 1.25;
  };

  for (const cluster of clusters) placeCluster(cluster);

  const leftovers = [...index.people.values()]
    .filter((p) => !placed.has(p.id))
    .sort((a, b) => personKey(a).localeCompare(personKey(b)));
  const leftoverUnits = collectUnits(index, leftovers, gens, placed);
  for (const cluster of clusterUnits(index, leftoverUnits)) placeCluster(cluster);

  const xs = [...merged.values()].map((p) => p.x);
  const minX = Math.min(...xs, 0);
  const nodes: LaidOutNode[] = [];
  for (const person of index.people.values()) {
    const p = merged.get(person.id) ?? { x: 0, y: (gens.get(person.id) ?? 0) * ROW };
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

export const treeMetrics = { NODE_W, NODE_H, GAP_X, GAP_Y, STEP };
