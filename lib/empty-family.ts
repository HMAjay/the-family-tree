import type { FamilySnapshot } from "@/lib/types";

export const emptyFamily = (familyName = "Our Family"): FamilySnapshot => ({
  familyName,
  viewerId: null,
  people: [],
  relationships: [],
  memories: [],
  events: [],
  heritage: {
    origins: "",
    nativePlace: "",
    traditions: [],
    languages: [],
    festivals: [],
    occupations: [],
    values: [],
    stories: [],
    recipes: [],
  },
});
