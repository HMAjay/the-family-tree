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
import { BondEdge, type BondFlowEdge } from "@/components/bond-edge";
import { Button } from "@/components/ui/button";
import { bondLabel, buildIndex, relationToSelected } from "@/lib/engine";
import { layoutTree } from "@/lib/layout";
import { useFamilyStore } from "@/store/family-store";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { HoverCard } from "@/components/hover-card";
import type { Person } from "@/lib/types";

const nodeTypes = { person: PersonNode };
const edgeTypes = { bond: BondEdge };

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
  const pos = useMemo(() => new Map(layout.map((n) => [n.id, n])), [layout]);

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
              dimmed: Boolean(selectedId && n.id !== selectedId),
            },
          }) satisfies PersonFlowNode
      ),
    [layout, selectedId, index]
  );

  const edges: Edge[] = useMemo(() => {
    const list: BondFlowEdge[] = [];
    const seen = new Set<string>();

    const pairKey = (a: string, b: string) => [a, b].sort().join("::");

    for (const p of people) {
      for (const childId of index.childrenOf.get(p.id) ?? []) {
        const child = index.people.get(childId);
        if (!child) continue;
        const key = `pc-${p.id}-${childId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({
          id: key,
          source: p.id,
          target: childId,
          sourceHandle: "child",
          type: "bond",
          data: { kind: "parent-child", label: bondLabel(p, child, "parent-child") },
        });
      }

      for (const spId of index.spousesOf.get(p.id) ?? []) {
        const key = pairKey(p.id, spId);
        if (seen.has(`sp-${key}`)) continue;
        seen.add(`sp-${key}`);
        const spouse = index.people.get(spId);
        if (!spouse) continue;
        const leftIsP = (pos.get(p.id)?.x ?? 0) <= (pos.get(spId)?.x ?? 0);
        list.push({
          id: `sp-${key}`,
          source: leftIsP ? p.id : spId,
          target: leftIsP ? spId : p.id,
          sourceHandle: "right",
          targetHandle: "left",
          type: "bond",
          data: { kind: "spouse", label: bondLabel(p, spouse, "spouse") },
        });
      }

      for (const sibId of index.siblingsOf.get(p.id) ?? []) {
        const shareParent = (index.parentsOf.get(p.id) ?? []).some((parent) =>
          (index.parentsOf.get(sibId) ?? []).includes(parent)
        );
        if (shareParent) continue;
        const key = pairKey(p.id, sibId);
        if (seen.has(`sib-${key}`)) continue;
        seen.add(`sib-${key}`);
        const sib = index.people.get(sibId);
        if (!sib) continue;
        const leftIsP = (pos.get(p.id)?.x ?? 0) <= (pos.get(sibId)?.x ?? 0);
        list.push({
          id: `sib-${key}`,
          source: leftIsP ? p.id : sibId,
          target: leftIsP ? sibId : p.id,
          sourceHandle: "right",
          targetHandle: "left",
          type: "bond",
          data: { kind: "sibling", label: bondLabel(p, sib, "sibling") },
        });
      }
    }
    return list;
  }, [people, index, pos]);

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

  const selectedName = selectedId ? index.people.get(selectedId)?.name : null;

  return (
    <div className="flex h-full min-h-[28rem] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 print:hidden md:px-8">
        <div>
          <p className="font-heading text-2xl text-maroon">Your family</p>
          <p className="text-xs text-muted-foreground">
            {selectedName
              ? `Showing how everyone is related to ${selectedName}. Double-click a person to open their profile.`
              : "Click a person to see how everyone else is related. Double-click to open a profile. Scroll to zoom."}
          </p>
        </div>
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
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.05}
          maxZoom={4}
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
          panOnScroll={false}
          panOnDrag
          nodesDraggable={false}
          onNodeClick={(_, node) => setSelected(node.id)}
          onNodeDoubleClick={(_, node) => router.push(`/person/${node.id}`)}
          onNodeMouseEnter={(e, node) => {
            const person = people.find((p) => p.id === node.id);
            if (person) setHover({ person, x: e.clientX, y: e.clientY });
          }}
          onNodeMouseMove={(e, node) => {
            const person = people.find((p) => p.id === node.id);
            if (person) setHover({ person, x: e.clientX, y: e.clientY });
          }}
          onNodeMouseLeave={() => setHover(null)}
          onPaneClick={() => {
            setHover(null);
            setSelected(null);
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#c4a35a" gap={32} size={1} />
          <Controls showInteractive={false} />
          <CenterButton />
        </ReactFlow>
        {hover && (
          <HoverCard
            person={hover.person}
            x={hover.x}
            y={hover.y}
            relation={relationToSelected(index, selectedId, hover.person.id)}
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
      <Button size="sm" variant="secondary" className="rounded-full" onClick={() => fitView({ padding: 0.2, duration: 600 })}>
        Center
      </Button>
    </div>
  );
}
