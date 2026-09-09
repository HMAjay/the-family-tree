"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { loginHref, saveCurrentTree } from "@/components/save-tree-button";
import { useFamilyStore } from "@/store/family-store";
import type { SavedTreePayload } from "@/lib/types";

export function TreeLoader() {
  const search = useSearchParams();
  const router = useRouter();
  const id = search.get("id");
  const shouldSave = search.get("save") === "1";
  const { user, loading } = useAuth();
  const hydrated = useFamilyStore((s) => s.hydrated);
  const loadSavedTree = useFamilyStore((s) => s.loadSavedTree);
  const loaded = useRef<string | null>(null);
  const savedOnce = useRef(false);

  useEffect(() => {
    if (!hydrated || !id || loading || !user) return;
    if (loaded.current === id) return;
    let cancelled = false;
    void fetch(`/api/trees/${id}`)
      .then(async (res) => {
        if (!res.ok) return;
        const data = (await res.json()) as { tree?: { id: string; snapshot: SavedTreePayload } };
        if (!data.tree || cancelled) return;
        loaded.current = data.tree.id;
        loadSavedTree(data.tree.id, data.tree.snapshot);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [id, user, loading, loadSavedTree, hydrated]);

  useEffect(() => {
    if (!hydrated || !shouldSave || loading || savedOnce.current) return;
    if (!user) {
      router.replace(loginHref(`/tree?save=1${id ? `&id=${id}` : ""}`));
      return;
    }
    savedOnce.current = true;
    void saveCurrentTree()
      .then((savedId) => router.replace(`/tree?id=${savedId}`))
      .catch(() => {
        savedOnce.current = false;
      });
  }, [shouldSave, loading, user, router, id, hydrated]);

  return null;
}
