"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { loginHref } from "@/components/save-tree-button";
import { Button } from "@/components/ui/button";
import { useFamilyStore } from "@/store/family-store";
import { blankTreePayload } from "@/lib/tree-payload";

type TreeListItem = {
  id: string;
  name: string;
  peopleCount: number;
  updatedAt: string;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const startEmpty = useFamilyStore((s) => s.startEmpty);
  const loadSavedTree = useFamilyStore((s) => s.loadSavedTree);
  const [trees, setTrees] = useState<TreeListItem[] | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/trees");
    if (res.status === 401) {
      router.replace(loginHref("/dashboard"));
      return;
    }
    const data = (await res.json()) as { trees?: TreeListItem[]; error?: string };
    if (!res.ok) {
      setError(data.error || "Could not load your trees.");
      setTrees([]);
      return;
    }
    setError("");
    setTrees(data.trees ?? []);
  }, [router]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(loginHref("/dashboard"));
      return;
    }
    void load();
  }, [loading, user, router, load]);

  async function createTree() {
    setCreating(true);
    try {
      const snapshot = blankTreePayload("Our Family");
      const res = await fetch("/api/trees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot, name: snapshot.familyName }),
      });
      const data = (await res.json()) as { error?: string; tree?: { id: string } };
      if (!res.ok || !data.tree) {
        setError(data.error || "Could not create a tree.");
        return;
      }
      startEmpty();
      loadSavedTree(data.tree.id, snapshot);
      router.push(`/tree?id=${data.tree.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function removeTree(id: string, name: string) {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    const res = await fetch(`/api/trees/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    const remoteId = useFamilyStore.getState().remoteTreeId;
    if (remoteId === id) startEmpty();
    await load();
  }

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-28 text-center text-muted-foreground">
        Loading your trees…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.25em] text-gold uppercase">Dashboard</p>
          <h1 className="font-heading mt-2 text-4xl text-maroon md:text-5xl">Your family trees</h1>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Saved trees live on your account. Drafts in this browser are only kept until you save.
          </p>
        </div>
        <Button className="rounded-full bg-maroon text-ivory" onClick={() => void createTree()} disabled={creating}>
          <Plus data-icon="inline-start" />
          {creating ? "Creating…" : "New tree"}
        </Button>
      </div>
      {error ? <p className="mt-6 text-sm text-destructive">{error}</p> : null}
      {trees === null ? (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      ) : trees.length === 0 ? (
        <div className="gold-border mt-10 rounded-3xl border bg-card p-10 text-center">
          <h2 className="font-heading text-3xl text-maroon">No saved trees yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Start a new one, add people, then save. You can keep as many trees as you like.</p>
          <Button className="mt-6 rounded-full bg-maroon text-ivory" onClick={() => void createTree()} disabled={creating}>
            Create your first tree
          </Button>
        </div>
      ) : (
        <ul className="mt-10 grid gap-3">
          {trees.map((tree) => (
            <li key={tree.id} className="gold-border flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-4">
              <div>
                <p className="font-heading text-2xl font-bold text-maroon">{tree.name}</p>
                <p className="text-sm text-muted-foreground">
                  {tree.peopleCount === 1 ? "1 person" : `${tree.peopleCount} people`}
                  {" · "}
                  Updated {new Date(tree.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/tree?id=${tree.id}`}
                  className="inline-flex h-8 items-center rounded-full bg-maroon px-3 text-sm text-ivory"
                >
                  Open
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => void removeTree(tree.id, tree.name)}
                >
                  <Trash2 data-icon="inline-start" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
