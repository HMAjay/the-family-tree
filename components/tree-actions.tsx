"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { snapshotFromStore } from "@/store/family-store";

export function TreeActions() {
  const { user } = useAuth();
  const router = useRouter();
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

  function print() {
    if (!user) return requireLogin("print");
    router.push("/print");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" className="rounded-full bg-maroon text-ivory" onClick={save} disabled={pending}>
        <Save data-icon="inline-start" />
        Save tree
      </Button>
      <Button size="sm" variant="outline" className="rounded-full" onClick={print}>
        <Printer data-icon="inline-start" />
        Print
      </Button>
      {status && <span className="text-xs text-muted-foreground">{status}</span>}
    </div>
  );
}
