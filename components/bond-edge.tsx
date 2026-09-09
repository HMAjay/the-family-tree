"use client";

import { BaseEdge, EdgeLabelRenderer, getBezierPath, getStraightPath, type Edge, type EdgeProps } from "@xyflow/react";

export type BondKind = "spouse" | "sibling" | "parent-child";

export type BondEdgeData = {
  label: string;
  kind: BondKind;
};

export type BondFlowEdge = Edge<BondEdgeData, "bond">;

export function BondEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
}: EdgeProps<BondFlowEdge>) {
  const straight = data?.kind === "spouse" || data?.kind === "sibling";
  const mostlyLevel = Math.abs(sourceY - targetY) < 48;
  const [edgePath, labelX, labelY] = straight && mostlyLevel
    ? getStraightPath({ sourceX, sourceY, targetX, targetY })
    : getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: "#c4a35a",
          strokeWidth: data?.kind === "spouse" ? 2.2 : 1.7,
          strokeDasharray: data?.kind === "sibling" ? "5 4" : undefined,
          ...style,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-none rounded-full border border-gold/70 bg-[#fbf6ec] px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-maroon uppercase shadow-sm"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
