import type {
  FamilySnapshot,
  PathStep,
  Person,
  RelationPath,
  Relationship,
  RelationshipType,
} from "./types";

export interface GraphIndex {
  people: Map<string, Person>;
  parentsOf: Map<string, string[]>;
  childrenOf: Map<string, string[]>;
  spousesOf: Map<string, string[]>;
  siblingsOf: Map<string, string[]>;
}

function push(map: Map<string, string[]>, key: string, value: string) {
  const list = map.get(key) ?? [];
  if (!list.includes(value)) list.push(value);
  map.set(key, list);
}

function kinLabel(from: Person, to: Person, kind: "parent" | "child" | "spouse" | "sibling") {
  if (kind === "parent") return from.gender === "female" ? "Mother" : from.gender === "male" ? "Father" : "Parent";
  if (kind === "child") return to.gender === "female" ? "Daughter" : to.gender === "male" ? "Son" : "Child";
  if (kind === "spouse") return to.gender === "female" ? "Wife" : to.gender === "male" ? "Husband" : "Spouse";
  return to.gender === "female" ? "Sister" : to.gender === "male" ? "Brother" : "Sibling";
}

export function buildIndex(people: Person[], relationships: Relationship[]): GraphIndex {
  const peopleMap = new Map(people.map((p) => [p.id, p]));
  const parentsOf = new Map<string, string[]>();
  const childrenOf = new Map<string, string[]>();
  const spousesOf = new Map<string, string[]>();
  const siblingsOf = new Map<string, string[]>();

  const addParent = (parentId: string, childId: string) => {
    push(parentsOf, childId, parentId);
    push(childrenOf, parentId, childId);
  };
  const addSpouse = (a: string, b: string) => {
    push(spousesOf, a, b);
    push(spousesOf, b, a);
  };
  const addSibling = (a: string, b: string) => {
    push(siblingsOf, a, b);
    push(siblingsOf, b, a);
  };

  for (const rel of relationships) {
    const { personA: a, personB: b, type } = rel;
    switch (type) {
      case "father":
      case "mother":
        addParent(a, b);
        break;
      case "son":
      case "daughter":
        addParent(b, a);
        break;
      case "husband":
      case "wife":
        addSpouse(a, b);
        break;
      case "brother":
      case "sister":
        addSibling(a, b);
        break;
      case "grandfather":
      case "grandmother":
        addParent(a, `__hint_grand_${a}_${b}`);
        break;
      default:
        break;
    }
  }

  // Treat grandfather/grandmother as parent-of-parent when a middle generation exists;
  // otherwise keep a synthetic two-step via an implicit link using extra parent edges.
  for (const rel of relationships) {
    const { personA: a, personB: b, type } = rel;
    if (type === "grandfather" || type === "grandmother") {
      const mids = parentsOf.get(b) ?? [];
      if (mids.length) {
        for (const mid of mids) addParent(a, mid);
      } else {
        addParent(a, b);
      }
    }
    if (type === "grandson" || type === "granddaughter") {
      const kids = childrenOf.get(b) ?? [];
      if (kids.length) {
        for (const kid of kids) addParent(b, kid);
      } else {
        addParent(b, a);
      }
    }
  }

  for (const [child, parents] of parentsOf) {
    if (parents.length >= 2) {
      for (let i = 0; i < parents.length; i++) {
        for (let j = i + 1; j < parents.length; j++) addSpouse(parents[i], parents[j]);
      }
    }
    void child;
  }

  for (const [parent, children] of childrenOf) {
    for (let i = 0; i < children.length; i++) {
      for (let j = i + 1; j < children.length; j++) addSibling(children[i], children[j]);
    }
    void parent;
  }

  return { people: peopleMap, parentsOf, childrenOf, spousesOf, siblingsOf };
}

export function getPerson(index: GraphIndex, id: string) {
  return index.people.get(id);
}

export function getParents(index: GraphIndex, id: string) {
  return (index.parentsOf.get(id) ?? []).map((pid) => index.people.get(pid)).filter(Boolean) as Person[];
}

export function getChildren(index: GraphIndex, id: string) {
  return (index.childrenOf.get(id) ?? []).map((cid) => index.people.get(cid)).filter(Boolean) as Person[];
}

export function getSiblings(index: GraphIndex, id: string) {
  return (index.siblingsOf.get(id) ?? []).map((sid) => index.people.get(sid)).filter(Boolean) as Person[];
}

export function getSpouse(index: GraphIndex, id: string) {
  return (index.spousesOf.get(id) ?? []).map((sid) => index.people.get(sid)).filter(Boolean) as Person[];
}

export function getAncestors(index: GraphIndex, id: string): Person[] {
  const seen = new Set<string>();
  const out: Person[] = [];
  const walk = (pid: string) => {
    for (const p of index.parentsOf.get(pid) ?? []) {
      if (seen.has(p)) continue;
      seen.add(p);
      const person = index.people.get(p);
      if (person) {
        out.push(person);
        walk(p);
      }
    }
  };
  walk(id);
  return out;
}

export function getDescendants(index: GraphIndex, id: string): Person[] {
  const seen = new Set<string>();
  const out: Person[] = [];
  const walk = (pid: string) => {
    for (const c of index.childrenOf.get(pid) ?? []) {
      if (seen.has(c)) continue;
      seen.add(c);
      const person = index.people.get(c);
      if (person) {
        out.push(person);
        walk(c);
      }
    }
  };
  walk(id);
  return out;
}

export function getGrandparents(index: GraphIndex, id: string) {
  const gps: Person[] = [];
  for (const p of getParents(index, id)) {
    gps.push(...getParents(index, p.id));
  }
  return uniquePeople(gps);
}

export function getGrandchildren(index: GraphIndex, id: string) {
  const gcs: Person[] = [];
  for (const c of getChildren(index, id)) {
    gcs.push(...getChildren(index, c.id));
  }
  return uniquePeople(gcs);
}

export function getUnclesAunts(index: GraphIndex, id: string) {
  const out: Person[] = [];
  for (const p of getParents(index, id)) {
    for (const sib of getSiblings(index, p.id)) {
      out.push(sib);
      out.push(...getSpouse(index, sib.id));
    }
  }
  return uniquePeople(out.filter((p) => p.id !== id));
}

export function getNiblings(index: GraphIndex, id: string) {
  const out: Person[] = [];
  for (const sib of getSiblings(index, id)) {
    out.push(...getChildren(index, sib.id));
  }
  return uniquePeople(out);
}

export function getCousins(index: GraphIndex, id: string) {
  const out: Person[] = [];
  for (const uncle of getUnclesAunts(index, id)) {
    out.push(...getChildren(index, uncle.id));
  }
  return uniquePeople(out.filter((p) => p.id !== id && !getSiblings(index, id).some((s) => s.id === p.id)));
}

function uniquePeople(people: Person[]) {
  const seen = new Set<string>();
  return people.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export function yearOf(person: Person) {
  if (typeof person.year === "number" && Number.isFinite(person.year) && person.year > 0) {
    return Math.trunc(person.year);
  }
  const legacy = (person as Person & { dateOfBirth?: string }).dateOfBirth;
  if (legacy) {
    const y = Number(String(legacy).slice(0, 4));
    if (Number.isFinite(y) && y > 0) return y;
  }
  return undefined;
}

export function lifespan(person: Person) {
  const y = yearOf(person);
  return y ? String(y) : "";
}

export function findPersonByName(people: Person[], query: string): Person | undefined {
  const q = query.trim().toLowerCase().replace(/[?.’']/g, "");
  if (!q) return undefined;
  const exact = people.find((p) => p.name.toLowerCase() === q || p.nickname?.toLowerCase() === q);
  if (exact) return exact;
  const starts = people.find(
    (p) => p.name.toLowerCase().startsWith(q) || p.name.toLowerCase().split(" ")[0] === q
  );
  if (starts) return starts;
  return people.find((p) => p.name.toLowerCase().includes(q) || p.nickname?.toLowerCase().includes(q));
}

type EdgeKind = "parent" | "child" | "spouse" | "sibling";

export function findRelationship(index: GraphIndex, fromId: string, toId: string): RelationPath {
  if (fromId === toId) {
    const p = index.people.get(fromId);
    return {
      personA: fromId,
      personB: toId,
      steps: [],
      summary: p ? `${p.name} is the same person.` : "Same person.",
      found: true,
    };
  }

  const queue: { id: string; steps: PathStep[] }[] = [{ id: fromId, steps: [] }];
  const seen = new Set<string>([fromId]);

  while (queue.length) {
    const cur = queue.shift()!;
    const neighbors: { id: string; kind: EdgeKind }[] = [];
    for (const p of index.parentsOf.get(cur.id) ?? []) neighbors.push({ id: p, kind: "parent" });
    for (const c of index.childrenOf.get(cur.id) ?? []) neighbors.push({ id: c, kind: "child" });
    for (const s of index.spousesOf.get(cur.id) ?? []) neighbors.push({ id: s, kind: "spouse" });
    for (const s of index.siblingsOf.get(cur.id) ?? []) neighbors.push({ id: s, kind: "sibling" });

    for (const n of neighbors) {
      if (seen.has(n.id)) continue;
      const fromP = index.people.get(cur.id);
      const toP = index.people.get(n.id);
      if (!fromP || !toP) continue;
      const step: PathStep = { fromId: cur.id, toId: n.id, label: kinLabel(fromP, toP, n.kind) };
      const steps = [...cur.steps, step];
      if (n.id === toId) {
        return {
          personA: fromId,
          personB: toId,
          steps,
          summary: summarizePath(index, fromId, toId, steps),
          found: true,
        };
      }
      seen.add(n.id);
      queue.push({ id: n.id, steps });
    }
  }

  const a = index.people.get(fromId)?.name ?? "This person";
  const b = index.people.get(toId)?.name ?? "that person";
  return {
    personA: fromId,
    personB: toId,
    steps: [],
    summary: `I couldn't find that relationship in the family tree. There is no verified path between ${a} and ${b}.`,
    found: false,
  };
}

function summarizePath(index: GraphIndex, fromId: string, toId: string, steps: PathStep[]) {
  const a = index.people.get(fromId)!;
  const b = index.people.get(toId)!;
  const labels = steps.map((s) => s.label);
  const via = (i: number) => index.people.get(steps[i].toId)?.name;
  if (steps.length === 1) {
    return `${a.name} is the ${steps[0].label.toLowerCase()} of ${b.name}.`;
  }
  if (labels[0] === "Father" && labels[1] === "Father") {
    return `${b.name}'s grandfather is ${a.name}, who is the father of ${b.name}'s father, ${via(0)}.`;
  }
  if ((labels[0] === "Father" || labels[0] === "Mother") && (labels[1] === "Father" || labels[1] === "Mother")) {
    const word = a.gender === "female" ? "grandmother" : "grandfather";
    return `${a.name} is the ${word} of ${b.name}, through ${via(0)}.`;
  }
  if ((labels[0] === "Brother" || labels[0] === "Sister") && (labels[1] === "Son" || labels[1] === "Daughter")) {
    const word = a.gender === "female" ? "aunt" : "uncle";
    return `${a.name} is the ${word} of ${b.name}, via ${via(0)}.`;
  }
  if ((labels[0] === "Son" || labels[0] === "Daughter") && (labels[1] === "Brother" || labels[1] === "Sister")) {
    const word = a.gender === "female" ? "niece" : "nephew";
    return `${a.name} is the ${word} of ${b.name}.`;
  }
  if (labels.length === 3 && (labels[0] === "Father" || labels[0] === "Mother") && (labels[1] === "Brother" || labels[1] === "Sister")) {
    return `${a.name} is a grandparent-side relative of ${b.name} through ${via(0)}.`;
  }
  const pretty = [a.name, ...steps.map((s) => `${s.label} → ${index.people.get(s.toId)?.name}`)].join(" → ");
  return `${a.name} is related to ${b.name}: ${pretty}.`;
}

export function roleOfPersonToSelected(index: GraphIndex, personId: string, selectedId: string | null): string {
  if (!selectedId) return "Family member";
  if (personId === selectedId) return "Selected";
  const person = index.people.get(personId);
  if (!person) return "Relative";

  const word = (male: string, female: string, other: string) =>
    person.gender === "female" ? female : person.gender === "male" ? male : other;

  const spouses = index.spousesOf.get(selectedId) ?? [];
  const siblings = index.siblingsOf.get(selectedId) ?? [];
  const parents = index.parentsOf.get(selectedId) ?? [];
  const children = index.childrenOf.get(selectedId) ?? [];

  if (spouses.includes(personId)) return word("Husband", "Wife", "Spouse");
  if (siblings.includes(personId)) return word("Brother", "Sister", "Sibling");
  if (parents.includes(personId)) return word("Father", "Mother", "Parent");
  if (children.includes(personId)) return word("Son", "Daughter", "Child");

  for (const p of parents) {
    if ((index.parentsOf.get(p) ?? []).includes(personId)) {
      return word("Grandfather", "Grandmother", "Grandparent");
    }
  }
  for (const c of children) {
    if ((index.childrenOf.get(c) ?? []).includes(personId)) {
      return word("Grandson", "Granddaughter", "Grandchild");
    }
  }
  for (const p of parents) {
    const parentSiblings = index.siblingsOf.get(p) ?? [];
    if (parentSiblings.includes(personId)) return word("Uncle", "Aunt", "Parent's sibling");
    for (const sib of parentSiblings) {
      if ((index.spousesOf.get(sib) ?? []).includes(personId)) return word("Uncle", "Aunt", "Aunt or uncle");
      if ((index.childrenOf.get(sib) ?? []).includes(personId)) return "Cousin";
    }
  }
  for (const sib of siblings) {
    if ((index.childrenOf.get(sib) ?? []).includes(personId)) return word("Nephew", "Niece", "Nibling");
  }
  for (const sp of spouses) {
    if ((index.parentsOf.get(sp) ?? []).includes(personId)) {
      return word("Father-in-law", "Mother-in-law", "Parent-in-law");
    }
    if ((index.siblingsOf.get(sp) ?? []).includes(personId)) {
      return word("Brother-in-law", "Sister-in-law", "Sibling-in-law");
    }
  }
  for (const sib of siblings) {
    if ((index.spousesOf.get(sib) ?? []).includes(personId)) {
      return word("Brother-in-law", "Sister-in-law", "Sibling-in-law");
    }
  }
  for (const c of children) {
    if ((index.spousesOf.get(c) ?? []).includes(personId)) {
      return word("Son-in-law", "Daughter-in-law", "Child-in-law");
    }
  }

  const path = findRelationship(index, personId, selectedId);
  if (!path.found) return "Relative";
  if (path.steps.length === 1) return path.steps[0].label;
  return "Relative";
}

export function relationToSelected(index: GraphIndex, selectedId: string | null, personId: string) {
  return roleOfPersonToSelected(index, personId, selectedId);
}

export function bondLabel(a: Person, b: Person, kind: "spouse" | "sibling" | "parent-child") {
  if (kind === "spouse") {
    if ([a.gender, b.gender].includes("male") && [a.gender, b.gender].includes("female")) return "Husband & wife";
    return "Spouses";
  }
  if (kind === "sibling") {
    if (a.gender === "male" && b.gender === "male") return "Brothers";
    if (a.gender === "female" && b.gender === "female") return "Sisters";
    return "Brother & sister";
  }
  const parent = a.gender === "female" ? "Mother" : a.gender === "male" ? "Father" : "Parent";
  const child = b.gender === "female" ? "daughter" : b.gender === "male" ? "son" : "child";
  return `${parent} & ${child}`;
}

export function generationMap(index: GraphIndex): Map<string, number> {
  const gen = new Map<string, number>();
  for (const id of index.people.keys()) gen.set(id, 0);

  const parentDepth = (id: string, seen: Set<string>): number => {
    const cached = gen.get(id);
    if (cached && cached > 0 && seen.size === 0) return cached;
    const parents = index.parentsOf.get(id) ?? [];
    if (!parents.length) return 0;
    let max = 0;
    for (const p of parents) {
      if (seen.has(p)) continue;
      seen.add(p);
      max = Math.max(max, parentDepth(p, seen) + 1);
      seen.delete(p);
    }
    return max;
  };

  for (const id of index.people.keys()) {
    gen.set(id, parentDepth(id, new Set()));
  }

  for (let pass = 0; pass < 8; pass++) {
    let changed = false;
    for (const id of index.people.keys()) {
      for (const s of index.spousesOf.get(id) ?? []) {
        const a = gen.get(id) ?? 0;
        const b = gen.get(s) ?? 0;
        const m = Math.max(a, b);
        if (a !== m) {
          gen.set(id, m);
          changed = true;
        }
        if (b !== m) {
          gen.set(s, m);
          changed = true;
        }
      }
      const parents = index.parentsOf.get(id) ?? [];
      if (parents.length) {
        const childGen = Math.max(...parents.map((p) => (gen.get(p) ?? 0))) + 1;
        if ((gen.get(id) ?? 0) < childGen) {
          gen.set(id, childGen);
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  let min = Infinity;
  for (const v of gen.values()) min = Math.min(min, v);
  if (Number.isFinite(min) && min !== 0) {
    for (const [k, v] of gen) gen.set(k, v - min);
  }
  return gen;
}

export function oldestAncestors(index: GraphIndex): Person[] {
  const gens = generationMap(index);
  let min = Infinity;
  for (const v of gens.values()) min = Math.min(min, v);
  const people = [...index.people.values()].filter((p) => gens.get(p.id) === min);
  return people.sort((a, b) => (yearOf(a) ?? 0) - (yearOf(b) ?? 0));
}

export function marriedIntoFamily(index: GraphIndex, familyName = "Sharma"): Person[] {
  const out: Person[] = [];
  for (const p of index.people.values()) {
    const spouses = getSpouse(index, p.id);
    if (!spouses.length) continue;
    const parents = getParents(index, p.id);
    const spouseHasParents = spouses.some((s) => getParents(index, s.id).length > 0);
    if (!parents.length && !spouseHasParents) continue;
    const sharesName = p.name.toLowerCase().includes(familyName.toLowerCase());
    const spouseShares = spouses.some((s) => s.name.toLowerCase().includes(familyName.toLowerCase()));
    if (!parents.length && (spouseShares || spouseHasParents)) {
      out.push(p);
    } else if (!parents.length && !sharesName && spouses.length) {
      out.push(p);
    }
  }
  return uniquePeople(out);
}

export function searchFamily(snapshot: FamilySnapshot, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { people: [], memories: [], events: [], places: [] as string[] };
  const people = snapshot.people.filter((p) =>
    [p.name, p.nickname, p.location, p.occupation, p.biography, p.notes]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(q))
  );
  const memories = snapshot.memories.filter((m) =>
    [m.title, m.description].some((v) => v.toLowerCase().includes(q))
  );
  const events = snapshot.events.filter((e) =>
    [e.title, e.description, e.location ?? ""].some((v) => v.toLowerCase().includes(q))
  );
  const places = [
    ...new Set(
      snapshot.people
        .map((p) => p.location)
        .filter((loc): loc is string => Boolean(loc && loc.toLowerCase().includes(q)))
    ),
  ];
  return { people, memories, events, places };
}

export function familyStats(snapshot: FamilySnapshot) {
  const index = buildIndex(snapshot.people, snapshot.relationships);
  const gens = generationMap(index);
  const genCount = gens.size ? Math.max(...gens.values()) + 1 : 0;
  const cities = new Set(snapshot.people.map((p) => p.location).filter(Boolean));
  const years = snapshot.people.map((p) => yearOf(p)).filter((n): n is number => Boolean(n));
  const span = years.length ? Math.max(...years) - Math.min(...years) : 0;
  const parentSets = new Set(
    snapshot.people
      .map((p) => (index.parentsOf.get(p.id) ?? []).slice().sort().join("|"))
      .filter(Boolean)
  );
  return {
    generations: genCount,
    members: snapshot.people.length,
    branches: Math.max(parentSets.size, 1),
    cities: cities.size,
    yearsOfHistory: span,
    memories: snapshot.memories.length,
    events: snapshot.events.length,
  };
}

export function personTimeline(person: Person, snapshot: FamilySnapshot) {
  const items: { year: string; title: string; detail: string }[] = [];
  const born = yearOf(person);
  if (born) {
    items.push({
      year: String(born),
      title: "Born",
      detail: `${person.name} was born${person.location ? ` in ${person.location}` : ""}.`,
    });
  }
  const index = buildIndex(snapshot.people, snapshot.relationships);
  const spouse = getSpouse(index, person.id)[0];
  if (spouse) {
    items.push({
      year: born ? String(born + 24) : "Wedding",
      title: `Married ${spouse.name}`,
      detail: `A partnership that bound two stories into one household.`,
    });
  }
  for (const child of getChildren(index, person.id)) {
    const childYear = yearOf(child);
    if (childYear) {
      items.push({
        year: String(childYear),
        title: `${child.name} was born`,
        detail: `${person.name} became a parent.`,
      });
    }
  }
  for (const ev of snapshot.events) {
    if (ev.associatedPeople.includes(person.id)) {
      items.push({ year: ev.date.slice(0, 4), title: ev.title, detail: ev.description });
    }
  }
  if (person.dateOfDeath) {
    items.push({
      year: person.dateOfDeath.slice(0, 4),
      title: "Remembered",
      detail: `${person.name} passed on, and the family continues to tell their story.`,
    });
  }
  return items.sort((a, b) => a.year.localeCompare(b.year));
}

export function inferMissingRelationships(people: Person[], relationships: Relationship[]): Relationship[] {
  const index = buildIndex(people, relationships);
  const existing = new Set(relationships.map((r) => `${r.personA}:${r.type}:${r.personB}`));
  const extra: Relationship[] = [];
  const add = (personA: string, type: RelationshipType, personB: string) => {
    const key = `${personA}:${type}:${personB}`;
    if (existing.has(key) || personA === personB) return;
    existing.add(key);
    extra.push({ id: `inf-${personA}-${type}-${personB}`, personA, personB, type });
  };

  for (const p of people) {
    for (const parent of getParents(index, p.id)) {
      add(parent.id, parent.gender === "female" ? "mother" : "father", p.id);
      add(p.id, p.gender === "female" ? "daughter" : "son", parent.id);
    }
    for (const child of getChildren(index, p.id)) {
      add(p.id, p.gender === "female" ? "mother" : "father", child.id);
    }
    for (const sib of getSiblings(index, p.id)) {
      add(p.id, p.gender === "female" ? "sister" : "brother", sib.id);
    }
    for (const sp of getSpouse(index, p.id)) {
      add(p.id, p.gender === "female" ? "wife" : "husband", sp.id);
    }
    for (const gp of getGrandparents(index, p.id)) {
      add(gp.id, gp.gender === "female" ? "grandmother" : "grandfather", p.id);
      add(p.id, p.gender === "female" ? "granddaughter" : "grandson", gp.id);
    }
    for (const gc of getGrandchildren(index, p.id)) {
      add(p.id, p.gender === "female" ? "grandmother" : "grandfather", gc.id);
    }
    for (const u of getUnclesAunts(index, p.id)) {
      add(u.id, u.gender === "female" ? "aunt" : "uncle", p.id);
      add(p.id, p.gender === "female" ? "niece" : "nephew", u.id);
    }
    for (const c of getCousins(index, p.id)) {
      add(p.id, "cousin", c.id);
    }
  }
  return extra;
}

export const tools = {
  getPerson,
  getParents,
  getChildren,
  getSiblings,
  getSpouse,
  getAncestors,
  getDescendants,
  findRelationship,
  searchFamily,
};
