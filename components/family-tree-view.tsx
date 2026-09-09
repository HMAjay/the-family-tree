"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { FamilyTreeCanvas } from "@/components/family-tree-canvas";

export function FamilyTreeView() {
  return (
    <ReactFlowProvider>
      <FamilyTreeCanvas />
    </ReactFlowProvider>
  );
}
