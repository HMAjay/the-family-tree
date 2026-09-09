export type Gender = "female" | "male" | "other";

export const RELATIONSHIP_TYPES = [
  "father",
  "mother",
  "son",
  "daughter",
  "brother",
  "sister",
  "co-brother",
  "co-sister",
  "husband",
  "wife",
  "son-in-law",
  "daughter-in-law",
  "grandfather",
  "grandmother",
  "great-grandfather",
  "great-grandmother",
  "grandson",
  "granddaughter",
  "great-grandson",
  "great-granddaughter",
  "uncle",
  "aunt",
  "great-uncle",
  "great-aunt",
  "nephew",
  "niece",
  "great-nephew",
  "great-niece",
  "cousin",
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number];

export interface Person {
  id: string;
  name: string;
  nickname?: string;
  gender: Gender;
  year?: number;
  dateOfDeath?: string;
  photo?: string;
  customPhoto?: boolean;
  location?: string;
  occupation?: string;
  biography?: string;
  notes?: string;
}

export interface Relationship {
  id: string;
  personA: string;
  personB: string;
  /** personA is [type] of personB */
  type: RelationshipType;
}

export type MediaType = "photo" | "letter" | "document" | "video";

export interface MemoryItem {
  id: string;
  title: string;
  description: string;
  date?: string;
  media: string;
  mediaType: MediaType;
  associatedPeople: string[];
  vintage?: boolean;
}

export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  location?: string;
  associatedPeople: string[];
}

export interface HeritageStory {
  title: string;
  body: string;
}

export interface HeritageRecipe {
  name: string;
  story: string;
}

export interface Heritage {
  origins: string;
  nativePlace: string;
  traditions: string[];
  languages: string[];
  festivals: string[];
  occupations: string[];
  values: string[];
  stories: HeritageStory[];
  recipes: HeritageRecipe[];
}

export interface FamilySnapshot {
  people: Person[];
  relationships: Relationship[];
  memories: MemoryItem[];
  events: FamilyEvent[];
  heritage: Heritage;
  viewerId: string | null;
  familyName: string;
}

export interface PathStep {
  fromId: string;
  toId: string;
  label: string;
}

export interface RelationPath {
  personA: string;
  personB: string;
  steps: PathStep[];
  summary: string;
  found: boolean;
}

export type HighlightMode =
  | "none"
  | "ancestors"
  | "descendants"
  | "siblings"
  | "spouses"
  | "path";
