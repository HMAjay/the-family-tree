import {
  buildIndex,
  findPersonByName,
  findRelationship,
  getAncestors,
  getChildren,
  getCousins,
  getDescendants,
  getGrandparents,
  getParents,
  getPerson,
  getSiblings,
  getSpouse,
  marriedIntoFamily,
  oldestAncestors,
} from "./engine";
import type { FamilySnapshot, PathStep } from "./types";

export interface ChatReply {
  text: string;
  personIds: string[];
  path?: PathStep[];
  showRelationship?: { fromId: string; toId: string };
}

function cleanName(raw: string) {
  return raw
    .replace(/[?!.]/g, "")
    .replace(/\b(the|a|an|of|my|our|me|i|please|show|all)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function listNames(people: { name: string }[]) {
  if (!people.length) return "no one recorded";
  if (people.length === 1) return people[0].name;
  if (people.length === 2) return `${people[0].name} and ${people[1].name}`;
  return `${people
    .slice(0, -1)
    .map((p) => p.name)
    .join(", ")}, and ${people[people.length - 1].name}`;
}

export function answerFamilyQuestion(snapshot: FamilySnapshot, question: string): ChatReply {
  const index = buildIndex(snapshot.people, snapshot.relationships);
  const q = question.trim();
  const lower = q.toLowerCase();
  const viewer = snapshot.viewerId ? getPerson(index, snapshot.viewerId) : undefined;

  const missing: ChatReply = {
    text: "I couldn't find that relationship in the family tree.",
    personIds: [],
  };

  if (!snapshot.people.length) {
    return {
      text: "This family tree is still waiting for its first ancestor. Add someone, and I will remember them.",
      personIds: [],
    };
  }

  const resolve = (raw: string) => {
    const name = cleanName(raw);
    if (!name) return undefined;
    if (["me", "i", "myself", "my"].includes(name.toLowerCase()) && viewer) return viewer;
    return findPersonByName(snapshot.people, name);
  };

  const father = lower.match(/who is (?:the )?father of (.+)/i) || lower.match(/who is (.+?)'s father/i);
  if (father) {
    const person = resolve(father[1]);
    if (!person) return missing;
    const parents = getParents(index, person.id).filter((p) => p.gender === "male");
    if (!parents.length) return { text: `I couldn't find a father for ${person.name} in the family tree.`, personIds: [person.id] };
    const dad = parents[0];
    return {
      text: `The father of ${person.name} is **${dad.name}**.`,
      personIds: [person.id, dad.id],
      showRelationship: { fromId: dad.id, toId: person.id },
    };
  }

  const mother = lower.match(/who is (?:the )?mother of (.+)/i) || lower.match(/who is (.+?)'s mother/i);
  if (mother) {
    const person = resolve(mother[1]);
    if (!person) return missing;
    const parents = getParents(index, person.id).filter((p) => p.gender === "female");
    if (!parents.length) return { text: `I couldn't find a mother for ${person.name} in the family tree.`, personIds: [person.id] };
    const mom = parents[0];
    return {
      text: `The mother of ${person.name} is **${mom.name}**.`,
      personIds: [person.id, mom.id],
      showRelationship: { fromId: mom.id, toId: person.id },
    };
  }

  const gf = lower.match(/who is (?:the )?grandfather of (.+)/i) || lower.match(/who is (.+?)'s grandfather/i) || lower.match(/who is my grandfather/i);
  if (gf) {
    const person = gf[1] ? resolve(gf[1]) : viewer;
    if (!person) return missing;
    const gps = getGrandparents(index, person.id).filter((p) => p.gender === "male");
    if (!gps.length) return { text: `I couldn't find a grandfather for ${person.name} in the family tree.`, personIds: [person.id] };
    const g = gps[0];
    const mid = getParents(index, person.id).find((p) => getParents(index, p.id).some((x) => x.id === g.id));
    const via = mid ? `, who is the father of ${person.name}'s ${mid.gender === "male" ? "father" : "mother"}, ${mid.name}` : "";
    return {
      text: `${person.name}'s grandfather is **${g.name}**${via}.`,
      personIds: [person.id, g.id, ...(mid ? [mid.id] : [])],
      showRelationship: { fromId: g.id, toId: person.id },
      path: findRelationship(index, g.id, person.id).steps,
    };
  }

  const gm = lower.match(/who is (?:the )?grandmother of (.+)/i) || lower.match(/who is (.+?)'s grandmother/i);
  if (gm) {
    const person = resolve(gm[1]);
    if (!person) return missing;
    const gps = getGrandparents(index, person.id).filter((p) => p.gender === "female");
    if (!gps.length) return { text: `I couldn't find a grandmother for ${person.name} in the family tree.`, personIds: [person.id] };
    return {
      text: `${person.name}'s grandmother is **${gps[0].name}**.`,
      personIds: [person.id, gps[0].id],
      showRelationship: { fromId: gps[0].id, toId: person.id },
    };
  }

  const children = lower.match(/who are (?:the )?children of (.+)/i) || lower.match(/who are (.+?)'s children/i);
  if (children) {
    const person = resolve(children[1]);
    if (!person) return missing;
    const kids = getChildren(index, person.id);
    if (!kids.length) return { text: `The family tree does not list children for ${person.name}.`, personIds: [person.id] };
    return {
      text: `The children of ${person.name} are **${listNames(kids)}**.`,
      personIds: [person.id, ...kids.map((k) => k.id)],
    };
  }

  const sibs = lower.match(/who are (?:the )?siblings of (.+)/i) || lower.match(/who are (.+?)'s siblings/i) || lower.match(/who are my (siblings|cousins)/i);
  if (lower.includes("cousin")) {
    const m = lower.match(/who are (?:the )?cousins of (.+)/i) || lower.match(/who are my cousins/i);
    if (m) {
      const person = m[1] ? resolve(m[1]) : viewer;
      if (!person) return missing;
      const cousins = getCousins(index, person.id);
      if (!cousins.length) return { text: `I couldn't find cousins for ${person.name} in the family tree.`, personIds: [person.id] };
      return {
        text: `${person.name}'s cousins are **${listNames(cousins)}**.`,
        personIds: [person.id, ...cousins.map((c) => c.id)],
      };
    }
  }
  if (sibs && !lower.includes("cousin")) {
    const person = sibs[1] && sibs[1] !== "siblings" ? resolve(sibs[1]) : viewer;
    if (!person) return missing;
    const list = getSiblings(index, person.id);
    if (!list.length) return { text: `No siblings are recorded for ${person.name}.`, personIds: [person.id] };
    return {
      text: `The siblings of ${person.name} are **${listNames(list)}**.`,
      personIds: [person.id, ...list.map((s) => s.id)],
    };
  }

  const related =
    lower.match(/how is (.+) related to (.+)/i) ||
    lower.match(/how am i related to (.+)/i) ||
    lower.match(/how are we related/i);
  if (related) {
    const a = related[1] && !lower.startsWith("how am i") ? resolve(related[1]) : viewer;
    const b = related[2] ? resolve(related[2]) : related[1] && lower.startsWith("how am i") ? resolve(related[1]) : undefined;
    if (!a || !b) return missing;
    const path = findRelationship(index, a.id, b.id);
    if (!path.found) return { text: path.summary, personIds: [a.id, b.id] };
    const pretty = [a.name, ...path.steps.map((s) => `${s.label} → ${index.people.get(s.toId)?.name}`)].join(" → ");
    return {
      text: path.summary + (path.steps.length ? `\n\n${pretty}` : ""),
      personIds: [a.id, b.id, ...path.steps.map((s) => s.toId)],
      path: path.steps,
      showRelationship: { fromId: a.id, toId: b.id },
    };
  }

  if (lower.includes("oldest ancestor")) {
    const old = oldestAncestors(index);
    if (!old.length) return missing;
    const first = old[0];
    return {
      text: `The oldest recorded ancestor is **${first.name}** (${first.dateOfBirth?.slice(0, 4) ?? "year unknown"}).`,
      personIds: old.map((p) => p.id),
    };
  }

  const desc = lower.match(/(?:show|who are)(?: me)? all descendants of (.+)/i) || lower.match(/descendants of (.+)/i);
  if (desc) {
    const person = resolve(desc[1]);
    if (!person) return missing;
    const d = getDescendants(index, person.id);
    if (!d.length) return { text: `${person.name} has no recorded descendants.`, personIds: [person.id] };
    return {
      text: `The descendants of ${person.name} are **${listNames(d)}**.`,
      personIds: [person.id, ...d.map((x) => x.id)],
    };
  }

  if (lower.includes("married into") || lower.includes("married into the")) {
    const married = marriedIntoFamily(index, "Sharma");
    if (!married.length) return { text: "I couldn't find anyone recorded as marrying into the Sharma family.", personIds: [] };
    return {
      text: `These people married into the Sharma family: **${listNames(married)}**.`,
      personIds: married.map((p) => p.id),
    };
  }

  if (lower.includes("ancestor") || lower.includes("lineage") || lower.includes("show my family")) {
    const person = viewer ?? snapshot.people[0];
    const anc = getAncestors(index, person.id);
    if (!anc.length) return { text: `No ancestors are recorded yet for ${person.name}.`, personIds: [person.id] };
    return {
      text: `${person.name}'s recorded ancestors are **${listNames(anc)}**.`,
      personIds: [person.id, ...anc.map((p) => p.id)],
    };
  }

  const spouseQ = lower.match(/who (?:is|did) (.+?)(?:'s spouse| married| marry)/i);
  if (spouseQ) {
    const person = resolve(spouseQ[1]);
    if (!person) return missing;
    const sps = getSpouse(index, person.id);
    if (!sps.length) return { text: `No spouse is recorded for ${person.name}.`, personIds: [person.id] };
    return {
      text: `${person.name} is married to **${listNames(sps)}**.`,
      personIds: [person.id, ...sps.map((s) => s.id)],
      showRelationship: { fromId: person.id, toId: sps[0].id },
    };
  }

  const named = snapshot.people.find((p) => lower.includes(p.name.toLowerCase()) || (p.nickname && lower.includes(p.nickname.toLowerCase())));
  if (named) {
    const parents = getParents(index, named.id);
    const kids = getChildren(index, named.id);
    return {
      text: `**${named.name}** is in the family tree${named.occupation ? `, remembered as a ${named.occupation.toLowerCase()}` : ""}. Parents: ${listNames(parents)}. Children: ${listNames(kids)}.`,
      personIds: [named.id],
    };
  }

  return {
    text: "I could not match that question to verified family-tree data. Try asking about a parent, child, sibling, spouse, ancestor, or how two people are related — using names as they appear in the tree.",
    personIds: [],
  };
}
