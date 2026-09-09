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
  coBrothersOf: Map<string, string[]>;
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
  const coBrothersOf = new Map<string, string[]>();

  const addParent = (parentId: string, childId: string) => {
    if (parentId === childId) return;
    if ((spousesOf.get(parentId) ?? []).includes(childId)) return;
    if (isAncestor(childId, parentId)) return;
    if (isAncestor(parentId, childId)) return;
    push(parentsOf, childId, parentId);
    push(childrenOf, parentId, childId);
  };
  const addSpouse = (a: string, b: string) => {
    if (a === b) return;
    if ((siblingsOf.get(a) ?? []).includes(b)) return;
    if ((parentsOf.get(a) ?? []).includes(b) || (parentsOf.get(b) ?? []).includes(a)) return;
    push(spousesOf, a, b);
    push(spousesOf, b, a);
  };
  const addSibling = (a: string, b: string) => {
    if (a === b) return;
    if ((spousesOf.get(a) ?? []).includes(b)) return;
    if ((parentsOf.get(a) ?? []).includes(b) || (parentsOf.get(b) ?? []).includes(a)) return;
    if ((childrenOf.get(a) ?? []).includes(b) || (childrenOf.get(b) ?? []).includes(a)) return;
    if (isAncestor(a, b) || isAncestor(b, a)) return;
    push(siblingsOf, a, b);
    push(siblingsOf, b, a);
  };

  function isAncestor(olderId: string, youngerId: string) {
    const seen = new Set<string>();
    const stack = [...(parentsOf.get(youngerId) ?? [])];
    while (stack.length) {
      const id = stack.pop()!;
      if (id === olderId) return true;
      if (seen.has(id)) continue;
      seen.add(id);
      stack.push(...(parentsOf.get(id) ?? []));
    }
    return false;
  }
  const addCoBrother = (a: string, b: string) => {
    if (a === b) return;
    push(coBrothersOf, a, b);
    push(coBrothersOf, b, a);
  };
  const dropLink = (map: Map<string, string[]>, a: string, b: string) => {
    map.set(a, (map.get(a) ?? []).filter((id) => id !== b));
    map.set(b, (map.get(b) ?? []).filter((id) => id !== a));
  };

  const delayed: Relationship[] = [];

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
      case "co-brother":
      case "co-sister":
        addCoBrother(a, b);
        break;
      case "uncle":
      case "aunt":
      case "nephew":
      case "niece":
      case "cousin":
      case "grandfather":
      case "grandmother":
      case "great-grandfather":
      case "great-grandmother":
      case "grandson":
      case "granddaughter":
      case "great-grandson":
      case "great-granddaughter":
      case "great-uncle":
      case "great-aunt":
      case "great-nephew":
      case "great-niece":
      case "son-in-law":
      case "daughter-in-law":
        delayed.push(rel);
        break;
      default:
        break;
    }
  }

  for (const rel of delayed) {
    const { personA: a, personB: b, type } = rel;
    if (type === "uncle" || type === "aunt") {
      const parents = (parentsOf.get(b) ?? []).filter((id) => peopleMap.has(id));
      for (const p of parents) addSibling(a, p);
    } else if (type === "nephew" || type === "niece") {
      const parents = (parentsOf.get(a) ?? []).filter((id) => peopleMap.has(id));
      for (const p of parents) addSibling(b, p);
    } else if (type === "cousin") {
      const parentsB = parentsOf.get(b) ?? [];
      for (const p of parentsB) {
        for (const sib of siblingsOf.get(p) ?? []) addParent(sib, a);
      }
    } else if (type === "grandfather" || type === "grandmother") {
      const mids = (parentsOf.get(b) ?? []).filter((id) => peopleMap.has(id));
      if (mids.length) {
        for (const mid of mids) addParent(a, mid);
      }
    } else if (type === "great-grandfather" || type === "great-grandmother") {
      const grandparents = uniqueIds(
        (parentsOf.get(b) ?? []).flatMap((p) => parentsOf.get(p) ?? []).filter((id) => peopleMap.has(id))
      );
      if (grandparents.length) {
        for (const gp of grandparents) addParent(a, gp);
      } else {
        const mids = (parentsOf.get(b) ?? []).filter((id) => peopleMap.has(id));
        for (const mid of mids) addParent(a, mid);
      }
    } else if (type === "grandson" || type === "granddaughter") {
      const kids = (childrenOf.get(b) ?? []).filter((id) => peopleMap.has(id));
      if (kids.length) {
        for (const kid of kids) addParent(kid, a);
      }
    } else if (type === "great-grandson" || type === "great-granddaughter") {
      const children = (childrenOf.get(b) ?? []).filter((id) => peopleMap.has(id));
      const grandkids = uniqueIds(children.flatMap((c) => childrenOf.get(c) ?? []).filter((id) => peopleMap.has(id)));
      if (grandkids.length) {
        for (const g of grandkids) addParent(g, a);
      } else if (children.length) {
        for (const kid of children) addParent(kid, a);
      }
    } else if (type === "great-uncle" || type === "great-aunt") {
      const grandparents = uniqueIds(
        (parentsOf.get(b) ?? []).flatMap((p) => parentsOf.get(p) ?? []).filter((id) => peopleMap.has(id))
      );
      for (const gp of grandparents) addSibling(a, gp);
    } else if (type === "great-nephew" || type === "great-niece") {
      const niblings = uniqueIds(
        (siblingsOf.get(a) ?? []).flatMap((s) => childrenOf.get(s) ?? []).filter((id) => peopleMap.has(id))
      );
      if (niblings.length) {
        for (const n of niblings) addParent(n, b);
      }
    }
  }

  function uniqueIds(ids: string[]) {
    return [...new Set(ids)];
  }

  const pickChildForInLaw = (parentId: string, inLawId: string, marryGender: Person["gender"] | null) => {
    const kids = (childrenOf.get(parentId) ?? []).filter((id) => peopleMap.has(id) && id !== inLawId);
    const ranked = [
      ...kids.filter((id) => (marryGender ? peopleMap.get(id)?.gender === marryGender : true) && !(spousesOf.get(id) ?? []).length),
      ...kids.filter((id) => (marryGender ? peopleMap.get(id)?.gender === marryGender : true)),
      ...kids.filter((id) => !(spousesOf.get(id) ?? []).length),
      ...kids,
    ];
    return ranked[0];
  };

  for (const rel of relationships) {
    const { personA: a, personB: b, type } = rel;
    if (type === "son-in-law" || type === "daughter-in-law") {
      const marry = type === "son-in-law" ? "female" : "male";
      const child = pickChildForInLaw(b, a, marry);
      if (child) addSpouse(a, child);
      else {
        for (const sp of spousesOf.get(a) ?? []) addParent(b, sp);
      }
    }
  }

  for (const [child, parents] of parentsOf) {
    const real = parents.filter((id) => peopleMap.has(id));
    if (real.length === 2 && !(siblingsOf.get(real[0]) ?? []).includes(real[1])) {
      addSpouse(real[0], real[1]);
    }
    void child;
  }

  for (const [childId, parents] of [...parentsOf.entries()]) {
    if (!peopleMap.has(childId)) continue;
    for (const parentId of parents) {
      if (!peopleMap.has(parentId)) continue;
      for (const spouseId of [...(spousesOf.get(parentId) ?? [])]) {
        if (spouseId === childId || !peopleMap.has(spouseId)) continue;
        if ((siblingsOf.get(parentId) ?? []).includes(spouseId)) continue;
        let inLaw = false;
        for (const sib of siblingsOf.get(parentId) ?? []) {
          if ((spousesOf.get(sib) ?? []).includes(spouseId)) inLaw = true;
        }
        if (inLaw) continue;
        addParent(spouseId, childId);
      }
    }
  }

  for (let pass = 0; pass < 12; pass++) {
    let changed = false;
    for (const [id, sibs] of [...siblingsOf.entries()]) {
      const myParents = [...(parentsOf.get(id) ?? [])];
      for (const sib of sibs) {
        if (sib === id) continue;
        for (const parentId of myParents) {
          if (parentId === sib) continue;
          if ((spousesOf.get(sib) ?? []).includes(parentId)) continue;
          const before = (parentsOf.get(sib) ?? []).length;
          addParent(parentId, sib);
          if ((parentsOf.get(sib) ?? []).length > before) changed = true;
        }
      }
    }
    if (!changed) break;
  }

  for (const [parent, children] of childrenOf) {
    for (let i = 0; i < children.length; i++) {
      for (let j = i + 1; j < children.length; j++) addSibling(children[i], children[j]);
    }
    void parent;
  }

  for (const [id, sibs] of [...siblingsOf.entries()]) {
    for (const sib of sibs) dropLink(spousesOf, id, sib);
  }

  for (const [childId, parents] of [...parentsOf.entries()]) {
    for (const parentId of [...parents]) {
      const others = (parentsOf.get(childId) ?? []).filter((p) => p !== parentId);
      const siblingOfParent = others.some((o) => (siblingsOf.get(parentId) ?? []).includes(o));
      if (siblingOfParent && !hasParentLink(relationships, parentId, childId)) {
        parentsOf.set(
          childId,
          (parentsOf.get(childId) ?? []).filter((p) => p !== parentId)
        );
        childrenOf.set(
          parentId,
          (childrenOf.get(parentId) ?? []).filter((c) => c !== childId)
        );
      }
    }
  }

  for (const id of peopleMap.keys()) {
    const spouses = spousesOf.get(id) ?? [];
    for (const sp of spouses) {
      for (const sib of siblingsOf.get(sp) ?? []) {
        for (const cob of spousesOf.get(sib) ?? []) {
          if (cob !== id) addCoBrother(id, cob);
        }
      }
    }
  }

  return { people: peopleMap, parentsOf, childrenOf, spousesOf, siblingsOf, coBrothersOf };
}

export function getPerson(index: GraphIndex, id: string) {
  return index.people.get(id);
}

export function getParents(index: GraphIndex, id: string) {
  return (index.parentsOf.get(id) ?? []).map((pid) => index.people.get(pid)).filter(Boolean) as Person[];
}

export function parentIdsFromRelationships(relationships: Relationship[], personId: string): string[] {
  const ids = new Set<string>();
  for (const r of relationships) {
    if ((r.type === "father" || r.type === "mother") && r.personB === personId) ids.add(r.personA);
    if ((r.type === "son" || r.type === "daughter") && r.personA === personId) ids.add(r.personB);
  }
  return [...ids];
}

export function hasParentLink(relationships: Relationship[], parentId: string, childId: string) {
  return relationships.some(
    (r) =>
      ((r.type === "father" || r.type === "mother") && r.personA === parentId && r.personB === childId) ||
      ((r.type === "son" || r.type === "daughter") && r.personA === childId && r.personB === parentId)
  );
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

function walkDistance(
  index: GraphIndex,
  startId: string,
  targetId: string,
  next: (id: string) => string[]
): number | null {
  const seen = new Set<string>([startId]);
  let layer = [startId];
  let depth = 0;
  while (layer.length && depth < 16) {
    if (layer.includes(targetId)) return depth;
    const following: string[] = [];
    for (const id of layer) {
      for (const n of next(id)) {
        if (seen.has(n)) continue;
        seen.add(n);
        following.push(n);
      }
    }
    layer = following;
    depth += 1;
  }
  return null;
}

function ancestorDistance(index: GraphIndex, personId: string, descendantId: string) {
  return walkDistance(index, descendantId, personId, (id) =>
    (index.parentsOf.get(id) ?? []).filter((pid) => index.people.has(pid))
  );
}

function descendantDistance(index: GraphIndex, personId: string, ancestorId: string) {
  return walkDistance(index, ancestorId, personId, (id) =>
    (index.childrenOf.get(id) ?? []).filter((cid) => index.people.has(cid))
  );
}

function generationWord(
  word: (male: string, female: string, other: string) => string,
  depth: number,
  up: boolean
) {
  const great = depth >= 3 ? "Great-".repeat(depth - 2) : "";
  if (up) {
    if (depth === 1) return word("Father", "Mother", "Parent");
    if (depth === 2) return word("Grandfather", "Grandmother", "Grandparent");
    return word(`${great}grandfather`, `${great}grandmother`, `${great}grandparent`);
  }
  if (depth === 1) return word("Son", "Daughter", "Child");
  if (depth === 2) return word("Grandson", "Granddaughter", "Grandchild");
  return word(`${great}grandson`, `${great}granddaughter`, `${great}grandchild`);
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
  if (!selectedId) return "";
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

  const up = ancestorDistance(index, personId, selectedId);
  if (up && up > 0) return generationWord(word, up, true);
  const down = descendantDistance(index, personId, selectedId);
  if (down && down > 0) return generationWord(word, down, false);

  for (const sib of siblings) {
    if ((index.spousesOf.get(sib) ?? []).includes(personId)) {
      return word("Brother-in-law", "Sister-in-law", "Sibling-in-law");
    }
  }
  for (const sp of spouses) {
    if ((index.siblingsOf.get(sp) ?? []).includes(personId)) {
      return word("Brother-in-law", "Sister-in-law", "Sibling-in-law");
    }
    if ((index.parentsOf.get(sp) ?? []).includes(personId)) {
      return word("Father-in-law", "Mother-in-law", "Parent-in-law");
    }
  }
  for (const c of children) {
    if ((index.spousesOf.get(c) ?? []).includes(personId)) {
      return word("Son-in-law", "Daughter-in-law", "Child-in-law");
    }
  }
  if ((index.coBrothersOf.get(selectedId) ?? []).includes(personId)) {
    return word("Co-brother", "Co-sister", "Co-sibling");
  }

  for (const p of parents) {
    const parentSiblings = index.siblingsOf.get(p) ?? [];
    if (parentSiblings.includes(personId)) return word("Uncle", "Aunt", "Parent's sibling");
    for (const sib of parentSiblings) {
      if ((index.spousesOf.get(sib) ?? []).includes(personId)) return word("Uncle", "Aunt", "Aunt or uncle");
      if ((index.childrenOf.get(sib) ?? []).includes(personId) && personId !== p) return "Cousin";
    }
  }
  for (const sib of siblings) {
    if ((index.childrenOf.get(sib) ?? []).includes(personId)) return word("Nephew", "Niece", "Nibling");
    for (const nibling of index.childrenOf.get(sib) ?? []) {
      if ((index.childrenOf.get(nibling) ?? []).includes(personId)) {
        return word("Great-nephew", "Great-niece", "Great-nibling");
      }
    }
  }
  for (const p of parents) {
    for (const gp of index.parentsOf.get(p) ?? []) {
      const gpSiblings = index.siblingsOf.get(gp) ?? [];
      if (gpSiblings.includes(personId)) return word("Great-uncle", "Great-aunt", "Grandparent's sibling");
      for (const sib of gpSiblings) {
        if ((index.spousesOf.get(sib) ?? []).includes(personId)) return word("Great-uncle", "Great-aunt", "Grandparent's sibling");
      }
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

  const isParentChild = (a: string, b: string) =>
    (index.parentsOf.get(a) ?? []).includes(b) || (index.parentsOf.get(b) ?? []).includes(a);

  for (let pass = 0; pass < 12; pass++) {
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
      for (const s of index.siblingsOf.get(id) ?? []) {
        if (isParentChild(id, s)) continue;
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
    for (const cob of index.coBrothersOf.get(p.id) ?? []) {
      const other = index.people.get(cob);
      if (!other) continue;
      add(p.id, other.gender === "female" ? "co-sister" : "co-brother", cob);
    }
    for (const child of getChildren(index, p.id)) {
      for (const inLaw of getSpouse(index, child.id)) {
        add(inLaw.id, inLaw.gender === "female" ? "daughter-in-law" : "son-in-law", p.id);
      }
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
