"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { memo } from "react";
import { lifespan } from "@/lib/engine";
import type { Person } from "@/lib/types";
import { cn } from "@/lib/utils";

export type PersonNodeData = {
  person: Person;
  relationLabel: string;
  highlighted: boolean;
  dimmed: boolean;
};

export type PersonFlowNode = Node<PersonNodeData, "person">;

function PersonNodeInner({ data, selected }: NodeProps<PersonFlowNode>) {
  if (!data?.person) return null;
  const { person, relationLabel, highlighted, dimmed } = data;
  return (
    <div
      className={cn(
        "gold-border w-[200px] cursor-pointer overflow-hidden rounded-2xl border bg-card text-left transition duration-300",
        (selected || highlighted) && "ring-2 ring-gold shadow-[0_0_20px_rgba(196,163,90,0.45)]",
        dimmed && "opacity-40"
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-gold !size-2 !border-none" />
      <Handle type="source" id="child" position={Position.Bottom} className="!bg-gold !size-2 !border-none" />
      <Handle type="source" id="right" position={Position.Right} className="!bg-gold !size-2 !border-none" />
      <Handle type="target" id="left" position={Position.Left} className="!bg-gold !size-2 !border-none" />
      <div className="relative h-28 overflow-hidden bg-secondary">
        {person.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.photo} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="px-3 py-3">
        <p className="font-heading text-lg leading-tight text-maroon">{person.name}</p>
        {lifespan(person) ? <p className="text-xs text-muted-foreground">{lifespan(person)}</p> : null}
        <p className="mt-2 text-[11px] tracking-wide text-gold uppercase">{relationLabel}</p>
      </div>
    </div>
  );
}

export const PersonNode = memo(PersonNodeInner);
