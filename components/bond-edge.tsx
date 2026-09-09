"use client";

import { BaseEdge, EdgeLabelRenderer, getBezierPath, getStraightPath, type Edge, type EdgeProps } from "@xyflow/react";

export type BondKind = "spouse" | "sibling" | "parent-child";

export type BondEdgeData = {
  label: string;
  kind: BondKind;
  showLabel?: boolean;
  active?: boolean;
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
          stroke: data?.active ? "#6b1d2a" : "#c4a35a",
          strokeWidth: data?.active ? 4 : data?.kind === "spouse" ? 3.2 : 2.6,
          strokeDasharray: data?.kind === "sibling" ? "5 4" : undefined,
          ...style,
        }}
      />
      {data?.showLabel && data.label ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none whitespace-nowrap rounded-full border border-maroon/40 bg-maroon px-3 py-1 text-xs font-extrabold tracking-wide text-ivory uppercase shadow-md"
            style={{
              position: "absolute",
              zIndex: 1000,
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
