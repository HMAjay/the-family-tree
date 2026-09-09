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

function find(parent: Map<string, string>, id: string): string {
  let cur = id;
  while (parent.get(cur) !== cur) {
    const next = parent.get(cur) ?? cur;
    parent.set(cur, parent.get(next) ?? next);
    cur = next;
  }
  return cur;
}

function union(parent: Map<string, string>, a: string, b: string) {
  const ra = find(parent, a);
  const rb = find(parent, b);
  if (ra !== rb) parent.set(ra, rb);
}

function orderCluster(index: GraphIndex, members: Person[]): Person[] {
  const remaining = new Set(members.map((p) => p.id));
  const byId = new Map(members.map((p) => [p.id, p]));
  const ordered: Person[] = [];

  const take = (id: string) => {
    if (!remaining.has(id)) return;
    remaining.delete(id);
    const person = byId.get(id);
    if (person) ordered.push(person);
  };

  const sorted = [...members].sort((a, b) => personKey(a).localeCompare(personKey(b)));
  for (const p of sorted) {
    if (!remaining.has(p.id)) continue;
    take(p.id);
    for (const sid of index.spousesOf.get(p.id) ?? []) take(sid);
    for (const sib of [...(index.siblingsOf.get(p.id) ?? [])].sort((a, b) => {
      const pa = byId.get(a);
      const pb = byId.get(b);
      return personKey(pa ?? { id: a, name: a, gender: "other" }).localeCompare(personKey(pb ?? { id: b, name: b, gender: "other" }));
    })) {
      take(sib);
      for (const sid of index.spousesOf.get(sib) ?? []) take(sid);
    }
  }
  return ordered;
}

function separateRow(nodes: LaidOutNode[]) {
  const row = [...nodes].sort((a, b) => a.x - b.x);
  for (let i = 1; i < row.length; i++) {
    const minX = row[i - 1].x + STEP;
    if (row[i].x < minX) row[i].x = minX;
  }
}

export function layoutTree(index: GraphIndex): LaidOutNode[] {
  const gens = generationMap(index);
  const byGen = new Map<number, Person[]>();
  for (const person of index.people.values()) {
    const g = gens.get(person.id) ?? 0;
    const list = byGen.get(g) ?? [];
    list.push(person);
    byGen.set(g, list);
  }

  const maxGen = byGen.size ? Math.max(...byGen.keys()) : 0;
  const nodes: LaidOutNode[] = [];
  const byId = new Map<string, LaidOutNode>();

  for (let g = 0; g <= maxGen; g++) {
    const people = byGen.get(g) ?? [];
    if (!people.length) continue;

    const parent = new Map<string, string>();
    for (const p of people) parent.set(p.id, p.id);
    for (const p of people) {
      for (const s of index.spousesOf.get(p.id) ?? []) {
        if (people.some((x) => x.id === s)) union(parent, p.id, s);
      }
      for (const s of index.siblingsOf.get(p.id) ?? []) {
        if (people.some((x) => x.id === s)) union(parent, p.id, s);
      }
    }

    const clusters = new Map<string, Person[]>();
    for (const p of people) {
      const root = find(parent, p.id);
      const list = clusters.get(root) ?? [];
      list.push(p);
      clusters.set(root, list);
    }

    const orderedClusters = [...clusters.values()]
      .map((members) => orderCluster(index, members))
      .sort((a, b) => {
        const parentXs = (group: Person[]) => {
          const xs: number[] = [];
          for (const p of group) {
            for (const pid of index.parentsOf.get(p.id) ?? []) {
              const n = byId.get(pid);
              if (n) xs.push(n.x);
            }
          }
          if (!xs.length) return null;
          return xs.reduce((s, v) => s + v, 0) / xs.length;
        };
        const ax = parentXs(a);
        const bx = parentXs(b);
        if (ax != null && bx != null && ax !== bx) return ax - bx;
        return personKey(a[0]).localeCompare(personKey(b[0]));
      });

    let x = 0;
    for (const cluster of orderedClusters) {
      for (const person of cluster) {
        const node: LaidOutNode = {
          id: person.id,
          person,
          x,
          y: g * (NODE_H + GAP_Y),
          generation: g,
        };
        nodes.push(node);
        byId.set(person.id, node);
        x += STEP;
      }
      x += GAP_X * 0.35;
    }
  }

  for (let pass = 0; pass < 6; pass++) {
    for (const node of nodes) {
      const kids = (index.childrenOf.get(node.id) ?? [])
        .map((id) => byId.get(id))
        .filter((n): n is LaidOutNode => Boolean(n));
      if (!kids.length) continue;
      const mid = (Math.min(...kids.map((k) => k.x)) + Math.max(...kids.map((k) => k.x))) / 2;
      const spouse = (index.spousesOf.get(node.id) ?? [])
        .map((id) => byId.get(id))
        .find((n) => n && n.generation === node.generation);
      if (spouse) {
        const coupleMid = (node.x + spouse.x) / 2;
        const dx = (mid - coupleMid) * 0.55;
        node.x += dx;
        spouse.x += dx;
      } else {
        node.x += (mid - node.x) * 0.55;
      }
    }

    for (let g = 0; g <= maxGen; g++) {
      separateRow(nodes.filter((n) => n.generation === g));
    }

    for (const node of nodes) {
      const parents = (index.parentsOf.get(node.id) ?? [])
        .map((id) => byId.get(id))
        .filter((n): n is LaidOutNode => Boolean(n));
      if (!parents.length) continue;
      const mid = (Math.min(...parents.map((p) => p.x)) + Math.max(...parents.map((p) => p.x))) / 2;
      node.x += (mid - node.x) * 0.25;
    }

    for (let g = 0; g <= maxGen; g++) {
      separateRow(nodes.filter((n) => n.generation === g));
    }
  }

  const minX = Math.min(...nodes.map((n) => n.x), 0);
  for (const n of nodes) n.x -= minX;
  return nodes;
}

export const treeMetrics = { NODE_W, NODE_H, GAP_X, GAP_Y };

export function sortByBirth(people: Person[]) {
  return [...people].sort((a, b) => (yearOf(a) ?? 0) - (yearOf(b) ?? 0));
}
