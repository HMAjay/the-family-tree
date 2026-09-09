"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { useFamilyStore } from "@/store/family-store";

export function loginHref(next: string) {
  return `/login?next=${encodeURIComponent(next)}`;
}

export async function saveCurrentTree() {
  const id = useFamilyStore.getState().remoteTreeId;
  const snapshot = useFamilyStore.getState().exportPayload();
  if (id) {
    const res = await fetch(`/api/trees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot, name: snapshot.familyName }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error || "Could not save.");
    return id;
  }
  const res = await fetch("/api/trees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ snapshot, name: snapshot.familyName }),
  });
  const data = (await res.json()) as { error?: string; tree?: { id: string } };
  if (!res.ok || !data.tree) throw new Error(data.error || "Could not save.");
  useFamilyStore.getState().loadSavedTree(data.tree.id, snapshot);
  return data.tree.id;
}

export function SaveTreeButton() {
  const { user } = useAuth();
  const router = useRouter();
  const remoteId = useFamilyStore((s) => s.remoteTreeId);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSave() {
    if (!user) {
      router.push(loginHref(`/tree?save=1${remoteId ? `&id=${remoteId}` : ""}`));
      return;
    }
    setStatus("saving");
    setMessage("");
    try {
      const id = await saveCurrentTree();
      setStatus("saved");
      router.replace(`/tree?id=${id}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not save.");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" className="rounded-full bg-maroon text-ivory" onClick={() => void onSave()} disabled={status === "saving"}>
        <Save data-icon="inline-start" />
        {status === "saving" ? "Saving…" : remoteId ? "Save" : "Save tree"}
      </Button>
      {status === "saved" ? <span className="text-xs text-muted-foreground">Saved</span> : null}
      {status === "error" ? <span className="text-xs text-destructive">{message}</span> : null}
    </div>
  );
}
