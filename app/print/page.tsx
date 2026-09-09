"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FamilyTreeView } from "@/components/family-tree-view";
import { useAuth } from "@/components/auth-provider";
import { useFamilyStore } from "@/store/family-store";

export default function PrintPage() {
  const { user, ready } = useAuth();
  const router = useRouter();
  const familyName = useFamilyStore((s) => s.familyName);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login?next=/print&intent=print");
      return;
    }
    const t = window.setTimeout(() => window.print(), 800);
    return () => window.clearTimeout(t);
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <div className="bg-ivory pt-8">
      <div className="print-header px-6 pb-4 text-center">
        <p className="font-heading text-4xl text-maroon">{familyName || "Our Family"}</p>
        <p className="text-sm text-muted-foreground">The Family Tree</p>
      </div>
      <FamilyTreeView />
    </div>
  );
}
