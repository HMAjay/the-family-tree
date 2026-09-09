"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { snapshotFromStore, useFamilyStore } from "@/store/family-store";
import type { FamilySnapshot } from "@/lib/types";

export function TreeActions() {
  const { user } = useAuth();
  const router = useRouter();
  const importSnapshot = useFamilyStore((s) => s.importSnapshot);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function requireLogin(intent: "save" | "print") {
    router.push(`/login?next=${encodeURIComponent("/tree")}&intent=${intent}`);
  }

  async function save() {
    if (!user) return requireLogin("save");
    setPending(true);
    setStatus(null);
    const res = await fetch("/api/family", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshotFromStore()),
    });
    setPending(false);
    setStatus(res.ok ? "Saved to your account." : "Could not save. Please try again.");
  }

  async function loadSaved() {
    if (!user) return requireLogin("save");
    const res = await fetch("/api/family");
    if (!res.ok) {
      setStatus("Could not load a saved tree.");
      return;
    }
    const body = (await res.json()) as { snapshot: FamilySnapshot | null };
    if (!body.snapshot?.people?.length) {
      setStatus("No saved tree on this account yet.");
      return;
    }
    importSnapshot(body.snapshot);
    setStatus("Loaded your saved tree.");
  }

  function print() {
    if (!user) return requireLogin("print");
    router.push("/print");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" className="rounded-full bg-maroon text-ivory" onClick={save} disabled={pending}>
        <Save data-icon="inline-start" />
        Save
      </Button>
      <Button size="sm" variant="outline" className="rounded-full" onClick={print}>
        <Printer data-icon="inline-start" />
        Print
      </Button>
      {user && (
        <Button size="sm" variant="ghost" onClick={loadSaved}>
          Load saved
        </Button>
      )}
      {status && <span className="text-xs text-muted-foreground">{status}</span>}
    </div>
  );
}
