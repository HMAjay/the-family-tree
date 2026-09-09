import { emptyFamily } from "@/lib/empty-family";
import type { SavedTreePayload } from "@/lib/types";

export function blankTreePayload(name = "Our Family"): SavedTreePayload {
  return {
    ...emptyFamily(name),
    positions: {},
    layoutRevision: 5,
  };
}

export function summarizeTree(payload: SavedTreePayload) {
  return {
    name: payload.familyName?.trim() || "Our Family",
    peopleCount: payload.people?.length ?? 0,
  };
}
