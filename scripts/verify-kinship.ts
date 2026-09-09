import { buildIndex, roleOfPersonToSelected } from "../lib/engine";
import { layoutTree } from "../lib/layout";
import type { Person, Relationship, RelationshipType } from "../lib/types";

function person(id: string, name: string, gender: Person["gender"]): Person {
  return { id, name, gender };
}

function rel(personA: string, type: RelationshipType, personB: string): Relationship {
  return { id: `${personA}-${type}-${personB}`, personA, personB, type };
}

const people: Person[] = [
  person("bcc", "Bcc", "male"),
  person("hs", "HS", "female"),
  person("anu", "Anu", "female"),
  person("vani", "Vani", "female"),
  person("jag", "Jagadeesh", "male"),
  person("manju", "Manju", "male"),
  person("ashwini", "Ashwini", "female"),
  person("avinash", "Avinash", "male"),
  person("akshara", "Akshara", "female"),
  person("ajay", "Ajay", "male"),
  person("akshay", "Akshay", "male"),
];

const relationships: Relationship[] = [
  rel("hs", "wife", "bcc"),
  rel("bcc", "father", "vani"),
  rel("bcc", "father", "anu"),
  rel("anu", "sister", "vani"),
  rel("jag", "husband", "anu"),
  rel("manju", "husband", "vani"),
  rel("ashwini", "daughter", "anu"),
  rel("avinash", "son", "anu"),
  rel("akshara", "daughter", "vani"),
  rel("ajay", "son", "vani"),
  rel("akshay", "son", "vani"),
];

const index = buildIndex(people, relationships);
const layout = layoutTree(index);
const byId = new Map(layout.map((n) => [n.id, n]));

function expect(cond: boolean, message: string) {
  if (!cond) throw new Error(message);
}

function label(selected: string, other: string) {
  return roleOfPersonToSelected(index, other, selected);
}

expect(label("vani", "jag") === "Brother-in-law", `Vani→Jagadeesh should be Brother-in-law, got ${label("vani", "jag")}`);
expect(label("vani", "anu") === "Sister", `Vani→Anu should be Sister, got ${label("vani", "anu")}`);
expect(label("vani", "ashwini") === "Niece", `Vani→Ashwini should be Niece, got ${label("vani", "ashwini")}`);
expect(label("vani", "avinash") === "Nephew", `Vani→Avinash should be Nephew, got ${label("vani", "avinash")}`);
expect(label("avinash", "vani") === "Aunt", `Avinash→Vani should be Aunt, got ${label("avinash", "vani")}`);
expect(label("avinash", "manju") === "Uncle", `Avinash→Manju should be Uncle, got ${label("avinash", "manju")}`);
expect(label("avinash", "bcc") === "Grandfather", `Avinash→Bcc should be Grandfather, got ${label("avinash", "bcc")}`);
expect(label("akshara", "bcc") === "Grandfather", `Akshata→Bcc should be Grandfather, got ${label("akshara", "bcc")}`);
expect(label("akshara", "hs") === "Grandmother", `Akshata→HS should be Grandmother, got ${label("akshara", "hs")}`);
expect(label("avinash", "akshara") === "Cousin", `Avinash→Akshara should be Cousin, got ${label("avinash", "akshara")}`);
expect(label("jag", "manju") === "Co-brother", `Jagadeesh→Manju should be Co-brother, got ${label("jag", "manju")}`);

expect(!(index.childrenOf.get("bcc") ?? []).includes("jag"), "Bcc should not list Jagadeesh as a child");
expect(!(index.parentsOf.get("bcc") ?? []).includes("jag"), "Jagadeesh should not be parent of Bcc");
expect((index.spousesOf.get("anu") ?? []).includes("jag"), "Anu and Jagadeesh should be spouses");

const anu = byId.get("anu")!;
const jag = byId.get("jag")!;
const vani = byId.get("vani")!;
const manju = byId.get("manju")!;
expect(anu.y === jag.y, "Anu and Jagadeesh should share a row");
expect(vani.y === manju.y, "Vani and Manju should share a row");
const anuJag = [anu.x, jag.x].sort((a, b) => a - b);
const vaniManju = [vani.x, manju.x].sort((a, b) => a - b);
expect(anuJag[1] < vaniManju[0] || vaniManju[1] < anuJag[0], "The two couples should not interleave");
expect(Math.abs(jag.x - anu.x) < 500, "Jagadeesh should sit beside Anu");

const kids = ["akshara", "ajay", "akshay"].map((id) => byId.get(id)!);
const kidMid = (Math.min(...kids.map((k) => k.x)) + Math.max(...kids.map((k) => k.x))) / 2;
const coupleMid = (vani.x + manju.x) / 2;
expect(Math.abs(kidMid - coupleMid) < 80, `Children should be centered under Vani & Manju (${kidMid} vs ${coupleMid})`);

const bcc = byId.get("bcc")!;
const hs = byId.get("hs")!;
expect(bcc.y === hs.y, "The starting couple should share the top row");
expect(anu.y > bcc.y, "Daughters should sit below the starting couple");
const treeMin = Math.min(...layout.map((n) => n.x));
const treeMax = Math.max(...layout.map((n) => n.x)) + 210;
const treeMid = (treeMin + treeMax) / 2;
const rootMid = (Math.min(bcc.x, hs.x) + Math.max(bcc.x, hs.x) + 210) / 2;
expect(Math.abs(treeMid - rootMid) < 60, `Starting couple should sit at the center of the tree (${rootMid} vs ${treeMid})`);

const twoSidesPeople: Person[] = [
  person("pgf", "PGF", "male"),
  person("pgm", "PGM", "female"),
  person("mgf", "MGF", "male"),
  person("mgm", "MGM", "female"),
  person("h", "Hari", "male"),
  person("w", "Willa", "female"),
  person("c1", "Cora", "female"),
  person("c2", "Cal", "male"),
];
const twoSidesRels: Relationship[] = [
  rel("pgm", "wife", "pgf"),
  rel("mgm", "wife", "mgf"),
  rel("pgf", "father", "h"),
  rel("mgf", "father", "w"),
  rel("h", "husband", "w"),
  rel("c1", "daughter", "w"),
  rel("c2", "son", "w"),
];
const twoLayout = layoutTree(buildIndex(twoSidesPeople, twoSidesRels));
const t = new Map(twoLayout.map((n) => [n.id, n]));
const mid = ((t.get("h")!.x + t.get("w")!.x) / 2 + 105);
const patMid = (t.get("pgf")!.x + t.get("pgm")!.x) / 2 + 105;
const matMid = (t.get("mgf")!.x + t.get("mgm")!.x) / 2 + 105;
expect(t.get("pgf")!.y === t.get("mgf")!.y, "Both grandparent couples should share a row");
expect(patMid < mid && mid < matMid, "Paternal grandparents should sit left of center and maternal right");
expect(Math.abs(mid - patMid - (matMid - mid)) < 80, `Grandparent sides should mirror around the couple (${patMid} ${mid} ${matMid})`);

const deepPeople: Person[] = [
  ...twoSidesPeople,
  person("ppgf", "PPGF", "male"),
  person("ppgm", "PPGM", "female"),
  person("pmgf", "PMGF", "male"),
  person("pmgm", "PMGM", "female"),
];
const deepRels: Relationship[] = [
  ...twoSidesRels,
  rel("ppgm", "wife", "ppgf"),
  rel("pmgm", "wife", "pmgf"),
  rel("ppgf", "father", "pgf"),
  rel("pmgf", "father", "pgm"),
];
const deepLayout = layoutTree(buildIndex(deepPeople, deepRels));
const dmap = new Map(deepLayout.map((n) => [n.id, n]));
const coupleMidDeep = (dmap.get("h")!.x + dmap.get("w")!.x) / 2 + 105;
const patCouple = (dmap.get("pgf")!.x + dmap.get("pgm")!.x) / 2 + 105;
const matCouple = (dmap.get("mgf")!.x + dmap.get("mgm")!.x) / 2 + 105;
const ppgMid = (dmap.get("ppgf")!.x + dmap.get("ppgm")!.x) / 2 + 105;
const pmgMid = (dmap.get("pmgf")!.x + dmap.get("pmgm")!.x) / 2 + 105;
expect(patCouple < coupleMidDeep && coupleMidDeep < matCouple, "Deep tree: grandparents still split from the middle couple");
expect(Math.abs(coupleMidDeep - patCouple - (matCouple - coupleMidDeep)) < 80, "Deep tree: grandparent sides stay mirrored around the middle");
expect(ppgMid < patCouple && patCouple < pmgMid, "Great-grandparents should split left/right of the paternal couple");
expect(Math.abs(patCouple - ppgMid - (pmgMid - patCouple)) < 90, `Great-grandparents should mirror around their child couple (${ppgMid} ${patCouple} ${pmgMid})`);
expect(dmap.get("ppgf")!.y < dmap.get("pgf")!.y, "Great-grandparents sit on the row above grandparents");

console.log("kinship and layout checks passed");
