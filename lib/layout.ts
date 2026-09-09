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
  focusRadius: number;
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
  return { pos, width: maxX - minX, apex: block.apex - minX, focusRadius: block.focusRadius };
}

function coupleApex(members: Person[], pos: Map<string, { x: number; y: number }>) {
  const first = pos.get(members[0].id);
  const last = pos.get(members[members.length - 1].id);
  if (!first || !last) return NODE_W / 2;
  return (first.x + last.x + NODE_W) / 2;
}

function packBlocks(blocks: Block[]): Block {
  if (!blocks.length) return { pos: new Map(), width: 0, apex: 0, focusRadius: 0 };
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
  return normalize({ pos, width: 0, apex: (firstApex + lastApex) / 2, focusRadius: 0 });
}

function layoutDescendants(index: GraphIndex, unit: Person[], gen: number, gens: Map<string, number>): Block {
  const couple = sortCouple(unit);
  const y = gen * ROW;
  const kids = childUnitsOf(index, couple, gen, gens);
  const coupleWidth = (couple.length - 1) * STEP + NODE_W;

  if (!kids.length) {
    const pos = new Map<string, { x: number; y: number }>();
    couple.forEach((p, i) => pos.set(p.id, { x: i * STEP, y }));
    return { pos, width: coupleWidth, apex: coupleWidth / 2, focusRadius: coupleWidth / 2 };
  }

  const childBlocks = kids.map((cu) => {
    const childGen = Math.max(...cu.map((p) => gens.get(p.id) ?? gen + 1));
    return layoutDescendants(index, cu, childGen, gens);
  });
  const packed = packBlocks(childBlocks);
  const width = Math.max(coupleWidth, packed.width);
  const childrenStart = (width - packed.width) / 2;
  const coupleStart = (width - coupleWidth) / 2;

  const pos = new Map<string, { x: number; y: number }>();
  couple.forEach((p, i) => pos.set(p.id, { x: coupleStart + i * STEP, y }));
  for (const [id, p] of packed.pos) pos.set(id, { x: p.x + childrenStart, y: p.y });

  const apex = coupleApex(couple, pos);
  return { pos, width, apex, focusRadius: coupleWidth / 2 };
}

function unitId(unit: Person[]) {
  return unit
    .map((p) => p.id)
    .sort()
    .join("|");
}

function recordedParents(index: GraphIndex, id: string): Person[] {
  return (index.parentsOf.get(id) ?? [])
    .map((pid) => index.people.get(pid))
    .filter((p): p is Person => Boolean(p));
}

function parentCouplesOf(
  index: GraphIndex,
  unit: Person[],
  gens: Map<string, number>
): { left: Person[] | null; right: Person[] | null } {
  const couple = sortCouple(unit);
  const leftPerson = couple[0];
  const rightPerson = couple[couple.length - 1];
  const leftParents = recordedParents(index, leftPerson.id);
  const rightParents = recordedParents(index, rightPerson.id);
  const left = leftParents[0] ? coupleOf(index, leftParents[0], gens) : null;
  const right = rightParents[0] ? coupleOf(index, rightParents[0], gens) : null;
  if (left && right && unitId(left) === unitId(right)) return { left, right: null };
  return { left, right };
}

function shiftBlock(block: Block, dx: number): Block {
  const pos = new Map<string, { x: number; y: number }>();
  for (const [id, p] of block.pos) pos.set(id, { x: p.x + dx, y: p.y });
  return { pos, width: block.width, apex: block.apex + dx, focusRadius: block.focusRadius };
}

function mergeKeepApex(blocks: Block[], apex: number, focusRadius: number): Block {
  const pos = new Map<string, { x: number; y: number }>();
  for (const block of blocks) {
    for (const [id, p] of block.pos) pos.set(id, p);
  }
  const { minX, maxX } = bbox(pos);
  return normalize({ pos, width: maxX - minX, apex, focusRadius });
}

function coupleOnlyBlock(unit: Person[], gens: Map<string, number>): Block {
  const couple = sortCouple(unit);
  const y = Math.min(...couple.map((p) => gens.get(p.id) ?? 0)) * ROW;
  const pos = new Map<string, { x: number; y: number }>();
  couple.forEach((p, i) => pos.set(p.id, { x: i * STEP, y }));
  const width = (couple.length - 1) * STEP + NODE_W;
  return { pos, width, apex: width / 2, focusRadius: width / 2 };
}

/** One parent side sits on the midpoint of the couple below. */
function centerAbove(ancestor: Block, down: Block): Block {
  const a = normalize(ancestor);
  const d = normalize(down);
  const dx = d.apex - a.apex;
  return mergeKeepApex([shiftBlock(a, dx), d], d.apex, d.focusRadius);
}

/** Both parent sides share the couple midpoint, then fan left and right. */
function mirrorAbove(left: Block, right: Block, down: Block): Block {
  const L = normalize(left);
  const R = normalize(right);
  const d = normalize(down);
  const half = Math.max(L.focusRadius, R.focusRadius) + GAP_X / 2;
  const lDx = d.apex - half - L.apex;
  const rDx = d.apex + half - R.apex;
  return mergeKeepApex([shiftBlock(L, lDx), shiftBlock(R, rDx), d], d.apex, d.focusRadius);
}

function parkOutside(base: Block, extra: Block, side: "left" | "right"): Block {
  if (!extra.pos.size) return base;
  const b = normalize(base);
  const e = normalize(extra);
  const dx = side === "left" ? -e.width - GAP_X : b.width + GAP_X;
  return mergeKeepApex([b, shiftBlock(e, dx)], b.apex, b.focusRadius);
}

function descendantCount(index: GraphIndex, unit: Person[]): number {
  const seen = new Set(unit.map((p) => p.id));
  const stack = [...seen];
  while (stack.length) {
    const id = stack.pop()!;
    for (const c of index.childrenOf.get(id) ?? []) {
      if (seen.has(c) || !index.people.has(c)) continue;
      seen.add(c);
      stack.push(c);
    }
  }
  return seen.size;
}

function extraChildUnits(
  index: GraphIndex,
  parentUnit: Person[],
  skip: Person[],
  gens: Map<string, number>
): Person[][] {
  const skipIds = new Set(skip.map((p) => p.id));
  const parentGen = Math.min(...parentUnit.map((p) => gens.get(p.id) ?? 0));
  return childUnitsOf(index, parentUnit, parentGen, gens).filter((cu) => !cu.some((m) => skipIds.has(m.id)));
}

function collateralBlock(
  index: GraphIndex,
  parentUnit: Person[],
  skip: Person[],
  gens: Map<string, number>
): Block {
  const extras = extraChildUnits(index, parentUnit, skip, gens);
  if (!extras.length) return { pos: new Map(), width: 0, apex: 0, focusRadius: 0 };
  const blocks = extras.map((cu) => {
    const childGen = Math.max(...cu.map((p) => gens.get(p.id) ?? 0));
    return layoutDescendants(index, cu, childGen, gens);
  });
  return packBlocks(blocks);
}

function ancestrySpine(
  index: GraphIndex,
  unit: Person[],
  gens: Map<string, number>,
  climbing: Set<string>
): Block {
  const id = unitId(unit);
  if (climbing.has(id)) return coupleOnlyBlock(unit, gens);
  const base = coupleOnlyBlock(unit, gens);
  return attachAncestors(index, unit, base, gens, climbing);
}

function attachAncestors(
  index: GraphIndex,
  unit: Person[],
  down: Block,
  gens: Map<string, number>,
  climbing: Set<string>
): Block {
  const id = unitId(unit);
  if (climbing.has(id)) return down;
  climbing.add(id);

  const { left, right } = parentCouplesOf(index, unit, gens);
  const nextClimb = new Set(climbing);

  let result = down;
  if (left && right) {
    const L = ancestrySpine(index, left, gens, nextClimb);
    const R = ancestrySpine(index, right, gens, nextClimb);
    result = mirrorAbove(L, R, down);
    result = parkOutside(result, collateralBlock(index, left, unit, gens), "left");
    result = parkOutside(result, collateralBlock(index, right, unit, gens), "right");
  } else if (left) {
    result = centerAbove(ancestrySpine(index, left, gens, nextClimb), down);
    result = parkOutside(result, collateralBlock(index, left, unit, gens), "left");
  } else if (right) {
    result = centerAbove(ancestrySpine(index, right, gens, nextClimb), down);
    result = parkOutside(result, collateralBlock(index, right, unit, gens), "right");
  }

  climbing.delete(id);
  return result;
}

function collectAllUnits(index: GraphIndex, gens: Map<string, number>): Person[][] {
  const units: Person[][] = [];
  const seen = new Set<string>();
  for (const p of index.people.values()) {
    if (seen.has(p.id)) continue;
    const unit = coupleOf(index, p, gens);
    for (const m of unit) seen.add(m.id);
    units.push(unit);
  }
  return units;
}

function pickCore(index: GraphIndex, units: Person[][], gens: Map<string, number>): Person[] {
  let best = units[0];
  let bestScore = -Infinity;
  for (const unit of units) {
    const { left, right } = parentCouplesOf(index, unit, gens);
    const both = Boolean(left && right);
    const descendants = descendantCount(index, unit);
    const hasKids = descendants > unit.length;
    const gen = Math.max(...unit.map((p) => gens.get(p.id) ?? 0));
    const score = both && hasKids ? 1_000_000 + gen * 1_000 + descendants : descendants * 10 - gen;
    if (score > bestScore) {
      best = unit;
      bestScore = score;
    }
  }
  return best;
}

export function layoutTree(index: GraphIndex): LaidOutNode[] {
  if (!index.people.size) return [];
  const gens = generationMap(index);
  const placed = new Set<string>();
  const merged = new Map<string, { x: number; y: number }>();
  let xOff = 0;
  const allUnits = collectAllUnits(index, gens);

  while (placed.size < index.people.size) {
    const open = allUnits.filter((unit) => unit.some((p) => !placed.has(p.id)));
    if (!open.length) {
      for (const person of index.people.values()) {
        if (placed.has(person.id)) continue;
        const unit = coupleOf(index, person, gens);
        open.push(unit);
        break;
      }
    }
    if (!open.length) break;
    const core = pickCore(index, open, gens);
    const coreGen = Math.min(...core.map((p) => gens.get(p.id) ?? 0));
    const down = layoutDescendants(index, core, coreGen, gens);
    const full = attachAncestors(index, core, down, gens, new Set());
    if (!full.pos.size) break;
    const before = placed.size;
    for (const [id, p] of full.pos) {
      if (placed.has(id)) continue;
      merged.set(id, { x: p.x + xOff, y: p.y });
      placed.add(id);
    }
    if (placed.size === before) {
      const gen = Math.min(...core.map((p) => gens.get(p.id) ?? 0));
      for (const p of core) {
        if (placed.has(p.id)) continue;
        merged.set(p.id, { x: xOff, y: gen * ROW });
        placed.add(p.id);
      }
      if (placed.size === before) break;
    }
    xOff += full.width + GAP_X * 1.25;
  }

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
