"use client";

import { Suspense } from "react";
import { FamilyTreeView } from "@/components/family-tree-view";
import { TreeLoader } from "@/components/tree-loader";

export default function TreePage() {
  return (
    <div className="h-[100dvh] pt-20">
      <Suspense>
        <TreeLoader />
      </Suspense>
      <FamilyTreeView />
    </div>
  );
}
