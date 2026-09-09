"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { FamilyTreeCanvas } from "@/components/family-tree-canvas";

export function FamilyTreeView() {
  return (
    <div className="h-full min-h-[28rem] w-full">
      <ReactFlowProvider>
        <FamilyTreeCanvas />
      </ReactFlowProvider>
    </div>
  );
}
