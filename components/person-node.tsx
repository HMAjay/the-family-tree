"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { memo } from "react";
import { lifespan } from "@/lib/engine";
import type { Person } from "@/lib/types";
import { PersonAvatar } from "@/components/person-avatar";
import { cn } from "@/lib/utils";

export type PersonNodeData = {
  person: Person;
  relationLabel: string;
  highlighted: boolean;
  dropTarget?: boolean;
};

export type PersonFlowNode = Node<PersonNodeData, "person">;

function PersonNodeInner({ data, selected }: NodeProps<PersonFlowNode>) {
  if (!data?.person) return null;
  const { person, relationLabel, highlighted, dropTarget } = data;
  return (
    <div className="relative h-full w-full" style={{ width: 210, height: 250 }}>
      <Handle type="target" id="parent" position={Position.Top} className="!bg-gold !size-2.5 !border-none" />
      <Handle type="source" id="child" position={Position.Bottom} className="!bg-gold !size-2.5 !border-none" />
      <Handle type="source" id="right" position={Position.Right} className="!bg-gold !size-2.5 !border-none" />
      <Handle type="target" id="left" position={Position.Left} className="!bg-gold !size-2.5 !border-none" />
      <div
        className={cn(
          "gold-border flex h-full w-full cursor-grab flex-col overflow-hidden rounded-2xl border bg-card text-left active:cursor-grabbing",
          (selected || highlighted) &&
            "outline outline-[3px] outline-offset-2 outline-maroon shadow-[0_0_0_6px_rgba(196,163,90,0.45)]",
          dropTarget && "outline outline-[3px] outline-offset-4 outline-dashed outline-gold shadow-[0_0_0_8px_rgba(196,163,90,0.35)]"
        )}
      >
        <div className="flex h-40 shrink-0 items-center justify-center bg-[#efe6d4]">
          <div className="size-[8.5rem] overflow-hidden rounded-full shadow-inner">
            <PersonAvatar person={person} />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-3 py-3">
          <p className="font-heading text-xl font-bold leading-tight text-maroon">{person.name}</p>
          {lifespan(person) ? <p className="text-sm text-muted-foreground">{lifespan(person)}</p> : null}
          {relationLabel ? (
            <p className="mt-auto text-base font-extrabold tracking-wide text-maroon uppercase">{relationLabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const PersonNode = memo(PersonNodeInner);
