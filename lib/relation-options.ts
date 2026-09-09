import type { RelationshipType } from "./types";

export const ADD_RELATION_ACTIONS: { type: RelationshipType; label: string }[] = [
  { type: "son", label: "Add a son" },
  { type: "daughter", label: "Add a daughter" },
  { type: "father", label: "Add a father" },
  { type: "mother", label: "Add a mother" },
  { type: "husband", label: "Add a husband" },
  { type: "wife", label: "Add a wife" },
  { type: "son-in-law", label: "Add a son-in-law" },
  { type: "daughter-in-law", label: "Add a daughter-in-law" },
  { type: "brother", label: "Add a brother" },
  { type: "sister", label: "Add a sister" },
  { type: "co-brother", label: "Add a co-brother" },
  { type: "co-sister", label: "Add a co-sister" },
  { type: "grandfather", label: "Add a grandfather" },
  { type: "grandmother", label: "Add a grandmother" },
  { type: "grandson", label: "Add a grandson" },
  { type: "granddaughter", label: "Add a granddaughter" },
  { type: "uncle", label: "Add an uncle" },
  { type: "aunt", label: "Add an aunt" },
  { type: "nephew", label: "Add a nephew" },
  { type: "niece", label: "Add a niece" },
  { type: "cousin", label: "Add a cousin" },
];

export const BOND_CHOICES: RelationshipType[] = ADD_RELATION_ACTIONS.map((a) => a.type);

export function relationNoun(type: RelationshipType) {
  return type;
}
