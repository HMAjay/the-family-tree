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
import { Plus, Printer } from "lucide-react";
import { PersonNode, type PersonFlowNode } from "@/components/person-node";
import { Button } from "@/components/ui/button";
import { buildIndex, relationToSelected } from "@/lib/engine";
import { layoutTree } from "@/lib/layout";
import { useFamilyStore } from "@/store/family-store";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { HoverCard } from "@/components/hover-card";
import type { Person } from "@/lib/types";

const nodeTypes = { person: PersonNode };

export function FamilyTreeCanvas() {
  const people = useFamilyStore((s) => s.people);
  const relationships = useFamilyStore((s) => s.relationships);
  const selectedId = useFamilyStore((s) => s.selectedId);
  const setSelected = useFamilyStore((s) => s.setSelected);
  const startEmpty = useFamilyStore((s) => s.startEmpty);
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [hover, setHover] = useState<{ person: Person; x: number; y: number } | null>(null);

  const index = useMemo(() => buildIndex(people, relationships), [people, relationships]);
  const layout = useMemo(() => layoutTree(index), [index]);

  const nodes: Node[] = useMemo(
    () =>
      layout.map(
        (n) =>
          ({
            id: n.id,
            type: "person",
            position: { x: n.x, y: n.y },
            style: { width: 210, height: 250 },
            data: {
              person: n.person,
              relationLabel: relationToSelected(index, selectedId, n.id),
              highlighted: n.id === selectedId,
              dimmed: false,
              onOpen: (id: string) => {
                setSelected(id);
                router.push(`/person/${id}`);
              },
            },
          }) satisfies PersonFlowNode
      ),
    [layout, selectedId, index, router, setSelected]
  );

  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [];
    for (const p of people) {
      for (const child of index.childrenOf.get(p.id) ?? []) {
        list.push({
          id: `pc-${p.id}-${child}`,
          source: p.id,
          target: child,
          style: { stroke: "#c4a35a", strokeWidth: 1.8 },
        });
      }
      for (const sp of index.spousesOf.get(p.id) ?? []) {
        if (p.id < sp) {
          list.push({
            id: `sp-${p.id}-${sp}`,
            source: p.id,
            target: sp,
            type: "straight",
            style: { stroke: "#c4a35a", strokeDasharray: "6 5", strokeWidth: 1.4 },
          });
        }
      }
    }
    return list;
  }, [people, index]);

  if (!people.length) {
    return (
      <div className="flex h-full min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-8">
          <div className="size-28 rounded-full border border-gold bg-maroon/10" />
          <div className="absolute inset-0 m-auto size-4 rounded-full bg-gold" style={{ animation: "gold-pulse 2.8s ease-in-out infinite" }} />
        </div>
        <h1 className="font-heading text-4xl text-maroon md:text-5xl">Every great story begins with someone.</h1>
        <p className="mt-3 max-w-md text-muted-foreground">Add the first ancestor. Children, parents, and spouses can join from there.</p>
        <Button type="button" className="mt-8 h-11 rounded-full bg-maroon px-8 text-ivory" onClick={() => setAddOpen(true)}>
          <Plus data-icon="inline-start" />
          Add the first ancestor
        </Button>
        <AddPersonDialog open={addOpen} onOpenChange={setAddOpen} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[28rem] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 print:hidden md:px-8">
        <p className="font-heading text-2xl text-maroon">Your family</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" className="rounded-full bg-maroon text-ivory" onClick={() => setAddOpen(true)}>
            <Plus data-icon="inline-start" />
            Add person
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => router.push("/print")}>
            <Printer data-icon="inline-start" />
            Print
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={() => startEmpty()}>
            New tree
          </Button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1" style={{ minHeight: 480 }}>
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
          <Background color="#c4a35a" gap={32} size={1} />
          <Controls showInteractive={false} />
          <CenterButton />
        </ReactFlow>
        {hover && (
          <HoverCard person={hover.person} x={hover.x} y={hover.y} relation={relationToSelected(index, selectedId, hover.person.id)} />
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
      <Button size="sm" variant="secondary" className="rounded-full" onClick={() => fitView({ duration: 600 })}>
        Center
      </Button>
    </div>
  );
}
