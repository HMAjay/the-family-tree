"use client";

import {
  Background,
  Controls,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PersonNode, type PersonFlowNode } from "@/components/person-node";
import { Button } from "@/components/ui/button";
import { buildIndex, getChildren, relationToSelected } from "@/lib/engine";
import { layoutTree } from "@/lib/layout";
import { useFamilyStore } from "@/store/family-store";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { HoverCard } from "@/components/hover-card";
import { TreeActions } from "@/components/tree-actions";
import type { Person } from "@/lib/types";

const nodeTypes = { person: PersonNode };

export function FamilyTreeCanvas() {
  const people = useFamilyStore((s) => s.people);
  const relationships = useFamilyStore((s) => s.relationships);
  const selectedId = useFamilyStore((s) => s.selectedId);
  const setSelected = useFamilyStore((s) => s.setSelected);
  const highlightMode = useFamilyStore((s) => s.highlightMode);
  const highlightIds = useFamilyStore((s) => s.highlightIds);
  const pathIds = useFamilyStore((s) => s.pathIds);
  const startEmpty = useFamilyStore((s) => s.startEmpty);
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [hover, setHover] = useState<{ person: Person; x: number; y: number } | null>(null);

  const index = useMemo(() => buildIndex(people, relationships), [people, relationships]);
  const layout = useMemo(() => layoutTree(index), [index]);
  const highlightSet = useMemo(() => new Set(highlightIds), [highlightIds]);
  const pathSet = useMemo(() => new Set(pathIds), [pathIds]);

  const nodes: Node[] = useMemo(() => {
    return layout.map((n) => {
      const highlighted =
        highlightMode === "none"
          ? false
          : highlightMode === "path"
            ? pathSet.has(n.id) || highlightSet.has(n.id)
            : highlightSet.has(n.id);
      const dimmed = highlightMode !== "none" && !highlighted && n.id !== selectedId;
      return {
        id: n.id,
        type: "person",
        position: { x: n.x, y: n.y },
        style: { width: 210, height: 250 },
        data: {
          person: n.person,
          relationLabel: relationToSelected(index, selectedId, n.id),
          highlighted,
          dimmed,
          onOpen: (id: string) => {
            setSelected(id);
            router.push(`/person/${id}`);
          },
        },
      } satisfies PersonFlowNode;
    });
  }, [layout, highlightMode, highlightSet, pathSet, selectedId, index, router, setSelected]);

  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [];
    for (const p of people) {
      for (const child of index.childrenOf.get(p.id) ?? []) {
        list.push({
          id: `pc-${p.id}-${child}`,
          source: p.id,
          target: child,
          style: { stroke: "#c4a35a", strokeWidth: 1.6 },
        });
      }
      for (const sp of index.spousesOf.get(p.id) ?? []) {
        if (p.id < sp) {
          list.push({
            id: `sp-${p.id}-${sp}`,
            source: p.id,
            target: sp,
            type: "straight",
            style: { stroke: "#c4a35a", strokeDasharray: "5 4", strokeWidth: 1.2 },
          });
        }
      }
    }
    return list;
  }, [people, index]);

  if (!people.length) {
    return (
      <EmptyTree
        onAdd={() => setAddOpen(true)}
        addOpen={addOpen}
        onOpenChange={setAddOpen}
      />
    );
  }

  return (
    <div className="flex h-full min-h-[28rem] flex-col">
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 print:hidden md:px-6">
        <TreeActions />
        <Button size="sm" className="rounded-full bg-maroon text-ivory" onClick={() => setAddOpen(true)}>
          Add person
        </Button>
        <Button size="sm" variant="ghost" onClick={() => startEmpty()}>
          Start empty tree
        </Button>
      </div>
      <div className="relative min-h-0 flex-1" style={{ minHeight: 420 }}>
        <ReactFlow
          className="h-full w-full"
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
          panOnScroll
          zoomOnPinch
          onNodeClick={(_, node) => setSelected(node.id)}
          onNodeMouseEnter={(e, node) => {
            const person = people.find((p) => p.id === node.id);
            if (person) setHover({ person, x: e.clientX, y: e.clientY });
          }}
          onNodeMouseLeave={() => setHover(null)}
          onPaneClick={() => setHover(null)}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#c4a35a" gap={28} size={1} />
          <Controls showInteractive={false} />
          <CenterButton />
        </ReactFlow>
        {hover && (
          <HoverCard
            person={hover.person}
            x={hover.x}
            y={hover.y}
            relation={relationToSelected(index, selectedId, hover.person.id)}
            childrenCount={getChildren(index, hover.person.id).length}
          />
        )}
      </div>
      <AddPersonDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function CenterButton() {
  const { fitView } = useReactFlow();
  return (
    <div className="absolute top-3 right-3 z-10 print:hidden">
      <Button size="sm" variant="secondary" onClick={() => fitView({ duration: 600 })}>
        Center tree
      </Button>
    </div>
  );
}

function EmptyTree({
  onAdd,
  addOpen,
  onOpenChange,
}: {
  onAdd: () => void;
  addOpen: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8">
        <div className="size-28 rounded-full border border-gold bg-maroon/10 shadow-[0_0_40px_rgba(196,163,90,0.45)]" />
        <div
          className="absolute inset-0 m-auto size-4 rounded-full bg-gold"
          style={{ animation: "gold-pulse 2.8s ease-in-out infinite" }}
        />
      </div>
      <h1 className="font-heading text-4xl text-maroon">Every great story begins with someone.</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        This tree is empty. Add the first ancestor, then connect parents, children, and spouses.
      </p>
      <Button type="button" className="mt-8 rounded-full bg-maroon text-ivory" onClick={onAdd}>
        Add the first ancestor
      </Button>
      <p className="mt-6 text-xs text-muted-foreground">Saving and printing require an account.</p>
      <div className="mt-4">
        <TreeActions />
      </div>
      <AddPersonDialog open={addOpen} onOpenChange={onOpenChange} />
    </div>
  );
}
