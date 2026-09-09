"use client";

import { useEffect } from "react";
import { FamilyTreeView } from "@/components/family-tree-view";
import { useFamilyStore } from "@/store/family-store";

export default function PrintPage() {
  const familyName = useFamilyStore((s) => s.familyName);

  useEffect(() => {
    const t = window.setTimeout(() => window.print(), 600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="bg-ivory pt-8">
      <div className="px-6 pb-4 text-center">
        <p className="font-heading text-4xl text-maroon">{familyName || "Our Family"}</p>
        <p className="text-sm text-muted-foreground">The Family Tree</p>
      </div>
      <FamilyTreeView />
    </div>
  );
}
