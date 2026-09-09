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
const GAP_X = 88;
const GAP_Y = 150;

export function layoutTree(index: GraphIndex): LaidOutNode[] {
  const gens = generationMap(index);
  const byGen = new Map<number, Person[]>();
  for (const person of index.people.values()) {
    const g = gens.get(person.id) ?? 0;
    const list = byGen.get(g) ?? [];
    list.push(person);
    byGen.set(g, list);
  }

  const placed = new Set<string>();
  const nodes: LaidOutNode[] = [];

  const maxGen = byGen.size ? Math.max(...byGen.keys()) : 0;

  for (let g = 0; g <= maxGen; g++) {
    const people = (byGen.get(g) ?? []).sort((a, b) => (yearOf(a) ?? 0) - (yearOf(b) ?? 0) || a.name.localeCompare(b.name));
    const ordered: Person[] = [];
    for (const p of people) {
      if (placed.has(p.id)) continue;
      ordered.push(p);
      placed.add(p.id);
      const spouses = (index.spousesOf.get(p.id) ?? [])
        .map((id: string) => index.people.get(id))
        .filter((s): s is Person => {
          if (!s) return false;
          return !placed.has(s.id) && (gens.get(s.id) ?? g) === g;
        });
      for (const s of spouses) {
        ordered.push(s);
        placed.add(s.id);
      }
    }

    ordered.forEach((person, i) => {
      nodes.push({
        id: person.id,
        person,
        x: i * (NODE_W + GAP_X),
        y: g * (NODE_H + GAP_Y),
        generation: g,
      });
    });
  }

  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (let pass = 0; pass < 4; pass++) {
    for (const node of nodes) {
      const kids = (index.childrenOf.get(node.id) ?? [])
        .map((id: string) => byId.get(id))
        .filter(Boolean) as LaidOutNode[];
      if (!kids.length) continue;
      const mid = (Math.min(...kids.map((k) => k.x)) + Math.max(...kids.map((k) => k.x))) / 2;
      const spouse = (index.spousesOf.get(node.id) ?? [])
        .map((id: string) => byId.get(id))
        .find((n) => n && n.generation === node.generation);
      if (spouse) {
        const coupleMid = (node.x + spouse.x) / 2;
        const dx = mid - coupleMid;
        node.x += dx * 0.35;
        spouse.x += dx * 0.35;
      } else {
        node.x += (mid - node.x) * 0.35;
      }
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
