"use client";

import {
  Background,
  Controls,
  ReactFlow,
  applyNodeChanges,
  useNodesInitialized,
  useReactFlow,
  type Edge,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutGrid, Plus, Redo2, Trash2, Undo2 } from "lucide-react";
import { PersonNode, type PersonFlowNode } from "@/components/person-node";
import { BondEdge, type BondFlowEdge } from "@/components/bond-edge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NodeContextMenu } from "@/components/node-context-menu";
import { buildIndex, relationToSelected } from "@/lib/engine";
import { layoutTree, treeMetrics } from "@/lib/layout";
import { useFamilyStore } from "@/store/family-store";
import { HoverCard } from "@/components/hover-card";
import type { Person } from "@/lib/types";

const nodeTypes = { person: PersonNode };
const edgeTypes = { bond: BondEdge };
const NODE_W = treeMetrics.NODE_W;
const NODE_H = treeMetrics.NODE_H;

function findDropTarget(dragged: Node, others: Node[]): Node | null {
  const d = { x: dragged.position.x, y: dragged.position.y, w: NODE_W, h: NODE_H };
  const cx = d.x + d.w / 2;
  const cy = d.y + d.h / 2;
  let best: { node: Node; score: number } | null = null;
  for (const n of others) {
    if (n.id === dragged.id) continue;
    const t = { x: n.position.x, y: n.position.y, w: NODE_W, h: NODE_H };
    const overlapX = Math.max(0, Math.min(d.x + d.w, t.x + t.w) - Math.max(d.x, t.x));
    const overlapY = Math.max(0, Math.min(d.y + d.h, t.y + t.h) - Math.max(d.y, t.y));
    const area = overlapX * overlapY;
    const inside = cx >= t.x && cx <= t.x + t.w && cy >= t.y && cy <= t.y + t.h;
    if (area < NODE_W * NODE_H * 0.16 && !inside) continue;
    const score = area + (inside ? 50_000 : 0);
    if (!best || score > best.score) best = { node: n, score };
  }
  return best?.node ?? null;
}

export function FamilyTreeCanvas() {
  const people = useFamilyStore((s) => s.people);
  const relationships = useFamilyStore((s) => s.relationships);
  const selectedId = useFamilyStore((s) => s.selectedId);
  const setSelected = useFamilyStore((s) => s.setSelected);
  const startEmpty = useFamilyStore((s) => s.startEmpty);
  const familyName = useFamilyStore((s) => s.familyName);
  const setFamilyName = useFamilyStore((s) => s.setFamilyName);
  const setAddOpen = useFamilyStore((s) => s.setAddOpen);
  const setNodePosition = useFamilyStore((s) => s.setNodePosition);
  const setPositions = useFamilyStore((s) => s.setPositions);
  const setBondEdit = useFamilyStore((s) => s.setBondEdit);
  const openAddRelated = useFamilyStore((s) => s.openAddRelated);
  const openEdit = useFamilyStore((s) => s.openEdit);
  const removePerson = useFamilyStore((s) => s.removePerson);
  const undo = useFamilyStore((s) => s.undo);
  const redo = useFamilyStore((s) => s.redo);
  const canUndo = useFamilyStore((s) => s.past.length > 0);
  const canRedo = useFamilyStore((s) => s.future.length > 0);
  const positions = useFamilyStore((s) => s.positions);
  const router = useRouter();
  const [hover, setHover] = useState<{ person: Person; x: number; y: number } | null>(null);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [arrangeToken, setArrangeToken] = useState(0);
  const arrangeSeen = useRef(0);
  const nodesRef = useRef<Node[]>([]);
  const dragOrigin = useRef<{ id: string; position: { x: number; y: number } } | null>(null);
  nodesRef.current = nodes;

  const index = useMemo(() => buildIndex(people, relationships), [people, relationships]);
  const layout = useMemo(() => layoutTree(index), [index]);

  useEffect(() => {
    const stored = useFamilyStore.getState().positions;
    const force = arrangeToken !== arrangeSeen.current;
    arrangeSeen.current = arrangeToken;
    setNodes((prev) => {
      const prevMap = new Map(prev.map((n) => [n.id, n]));
      return layout.map(
        (n) =>
          ({
            id: n.id,
            type: "person",
            position: force ? { x: n.x, y: n.y } : (stored[n.id] ?? prevMap.get(n.id)?.position ?? { x: n.x, y: n.y }),
            style: { width: 210, height: 250 },
            data: {
              person: n.person,
              relationLabel: relationToSelected(index, selectedId, n.id),
              highlighted: n.id === selectedId,
            },
          }) satisfies PersonFlowNode
      );
    });
  }, [layout, index, selectedId, arrangeToken, positions]);

  const edges: Edge[] = useMemo(() => {
    const list: BondFlowEdge[] = [];
    const seen = new Set<string>();
    const pos = new Map(nodes.map((n) => [n.id, n.position]));
    const pairKey = (a: string, b: string) => [a, b].sort().join("::");
    const touchesSelected = (a: string, b: string) => Boolean(selectedId && (a === selectedId || b === selectedId));
    const labelTowardSelected = (a: string, b: string) => {
      if (!selectedId || !touchesSelected(a, b)) return "";
      const other = a === selectedId ? b : a;
      return relationToSelected(index, selectedId, other);
    };

    for (const p of people) {
      for (const childId of index.childrenOf.get(p.id) ?? []) {
        const child = index.people.get(childId);
        if (!child) continue;
        if ((index.spousesOf.get(p.id) ?? []).includes(childId)) continue;
        if ((index.siblingsOf.get(p.id) ?? []).includes(childId)) continue;
        const key = `pc-${p.id}-${childId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const active = touchesSelected(p.id, childId);
        list.push({
          id: key,
          source: p.id,
          target: childId,
          sourceHandle: "child",
          targetHandle: "parent",
          type: "bond",
          data: { kind: "parent-child", label: labelTowardSelected(p.id, childId), showLabel: active, active },
        });
      }

      for (const spId of index.spousesOf.get(p.id) ?? []) {
        const key = pairKey(p.id, spId);
        if (seen.has(`sp-${key}`)) continue;
        seen.add(`sp-${key}`);
        const spouse = index.people.get(spId);
        if (!spouse) continue;
        if ((index.siblingsOf.get(p.id) ?? []).includes(spId)) continue;
        const leftIsP = (pos.get(p.id)?.x ?? 0) <= (pos.get(spId)?.x ?? 0);
        const active = touchesSelected(p.id, spId);
        list.push({
          id: `sp-${key}`,
          source: leftIsP ? p.id : spId,
          target: leftIsP ? spId : p.id,
          sourceHandle: "right",
          targetHandle: "left",
          type: "bond",
          data: { kind: "spouse", label: labelTowardSelected(p.id, spId), showLabel: active, active },
        });
      }

      for (const sibId of index.siblingsOf.get(p.id) ?? []) {
        const shareParent = (index.parentsOf.get(p.id) ?? []).some((parent) =>
          (index.parentsOf.get(sibId) ?? []).includes(parent)
        );
        if (shareParent && !touchesSelected(p.id, sibId)) continue;
        const key = pairKey(p.id, sibId);
        if (seen.has(`sib-${key}`)) continue;
        seen.add(`sib-${key}`);
        const sib = index.people.get(sibId);
        if (!sib) continue;
        const leftIsP = (pos.get(p.id)?.x ?? 0) <= (pos.get(sibId)?.x ?? 0);
        const active = touchesSelected(p.id, sibId);
        list.push({
          id: `sib-${key}`,
          source: leftIsP ? p.id : sibId,
          target: leftIsP ? sibId : p.id,
          sourceHandle: "right",
          targetHandle: "left",
          type: "bond",
          data: { kind: "sibling", label: labelTowardSelected(p.id, sibId), showLabel: active, active },
        });
      }

      for (const cobId of index.coBrothersOf.get(p.id) ?? []) {
        if (!touchesSelected(p.id, cobId)) continue;
        const key = pairKey(p.id, cobId);
        if (seen.has(`cob-${key}`) || seen.has(`sp-${key}`) || seen.has(`sib-${key}`)) continue;
        seen.add(`cob-${key}`);
        const cob = index.people.get(cobId);
        if (!cob) continue;
        const leftIsP = (pos.get(p.id)?.x ?? 0) <= (pos.get(cobId)?.x ?? 0);
        list.push({
          id: `cob-${key}`,
          source: leftIsP ? p.id : cobId,
          target: leftIsP ? cobId : p.id,
          sourceHandle: "right",
          targetHandle: "left",
          type: "bond",
          data: { kind: "sibling", label: labelTowardSelected(p.id, cobId), showLabel: true, active: true },
        });
      }
    }
    return list;
  }, [people, index, nodes, selectedId]);

  const displayNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...(n.data as PersonFlowNode["data"]),
          dropTarget: n.id === dropTargetId,
        },
      })),
    [nodes, dropTargetId]
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onNodeDragStart = useCallback((_: unknown, node: Node) => {
    dragOrigin.current = { id: node.id, position: { ...node.position } };
    setHover(null);
    setDropTargetId(null);
  }, []);

  const onNodeDrag = useCallback((_: unknown, node: Node) => {
    const over = findDropTarget(node, nodesRef.current);
    setDropTargetId(over?.id ?? null);
  }, []);

  const onNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      const over = findDropTarget(node, nodesRef.current);
      const origin = dragOrigin.current;
      dragOrigin.current = null;
      setDropTargetId(null);
      if (over && origin) {
        setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, position: origin.position } : n)));
        setBondEdit({ fromId: node.id, toId: over.id });
        return;
      }
      setNodePosition(node.id, node.position);
    },
    [setNodePosition, setBondEdit]
  );

  const arrange = useCallback(() => {
    const next: Record<string, { x: number; y: number }> = {};
    for (const n of layout) next[n.id] = { x: n.x, y: n.y };
    setPositions(next);
    setArrangeToken((n) => n + 1);
  }, [layout, setPositions]);

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    const name = index.people.get(selectedId)?.name ?? "this person";
    if (!window.confirm(`Remove ${name} from the tree? Their bonds will be removed too.`)) return;
    removePerson(selectedId);
    setMenu(null);
  }, [selectedId, index, removePerson]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, selectedId, deleteSelected]);

  if (!people.length) {
    return (
      <div className="flex h-full min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-8">
          <div className="size-28 rounded-full border border-gold bg-maroon/10" />
          <div className="absolute inset-0 m-auto size-4 rounded-full bg-gold" style={{ animation: "gold-pulse 2.8s ease-in-out infinite" }} />
        </div>
        <h1 className="font-heading text-4xl text-maroon md:text-5xl">Every great story begins with someone.</h1>
        <p className="mt-3 max-w-md text-muted-foreground">Add the first member. Children, parents, and spouses can join from there.</p>
        <button
          type="button"
          className="relative z-10 mt-8 inline-flex h-11 items-center rounded-full bg-maroon px-8 text-sm text-ivory"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="mr-2 size-4" />
          Add the first member
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[28rem] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Input
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="Family name"
          aria-label="Family name"
          className="font-heading h-11 max-w-md border-transparent bg-transparent px-1 text-2xl font-bold text-maroon shadow-none focus-visible:border-gold/50 focus-visible:ring-gold/30 md:text-2xl"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" className="rounded-full bg-maroon text-ivory" onClick={() => setAddOpen(true)}>
            <Plus data-icon="inline-start" />
            Add person
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" onClick={arrange}>
            <LayoutGrid data-icon="inline-start" />
            Arrange
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" disabled={!canUndo} onClick={() => undo()}>
            <Undo2 data-icon="inline-start" />
            Undo
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" disabled={!canRedo} onClick={() => redo()}>
            <Redo2 data-icon="inline-start" />
            Redo
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            disabled={!selectedId}
            onClick={deleteSelected}
          >
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground" onClick={() => startEmpty()}>
            New tree
          </Button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1" style={{ minHeight: 480 }}>
        <ReactFlow
          className="h-full w-full"
          defaultEdgeOptions={{
            type: "bond",
            style: { strokeWidth: 5, stroke: "#b8892d" },
          }}
          nodes={displayNodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          fitView
          fitViewOptions={{ padding: 0.28, maxZoom: 1 }}
          minZoom={0.05}
          maxZoom={4}
          zoomOnScroll
          zoomOnPinch
          zoomOnDoubleClick={false}
          panOnScroll={false}
          panOnDrag
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          selectNodesOnDrag={false}
          nodeDragThreshold={4}
          onNodeClick={(_, node) => {
            setMenu(null);
            setSelected(node.id);
          }}
          onNodeDoubleClick={(_, node) => {
            setMenu(null);
            setHover(null);
            router.push(`/person/${node.id}`);
          }}
          onNodeContextMenu={(event, node) => {
            event.preventDefault();
            setHover(null);
            setSelected(node.id);
            setMenu({ id: node.id, x: event.clientX, y: event.clientY });
          }}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
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
            setMenu(null);
          }}
          onPaneContextMenu={(event) => event.preventDefault()}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#c4a35a" gap={32} size={1} />
          <Controls showInteractive={false} />
          <CenterButton arrangeToken={arrangeToken} />
        </ReactFlow>
        {menu && (
          <NodeContextMenu
            name={index.people.get(menu.id)?.name ?? "this person"}
            x={menu.x}
            y={menu.y}
            onEdit={() => {
              openEdit(menu.id);
              setMenu(null);
            }}
            onDelete={() => {
              setSelected(menu.id);
              const name = index.people.get(menu.id)?.name ?? "this person";
              setMenu(null);
              if (!window.confirm(`Remove ${name} from the tree? Their bonds will be removed too.`)) return;
              removePerson(menu.id);
            }}
            onAdd={(type) => {
              openAddRelated(menu.id, type);
              setMenu(null);
            }}
            onClose={() => setMenu(null)}
          />
        )}
        {hover && !menu && (
          <HoverCard
            person={hover.person}
            x={hover.x}
            y={hover.y}
            relation={relationToSelected(index, selectedId, hover.person.id)}
          />
        )}
      </div>
    </div>
  );
}

function CenterButton({ arrangeToken }: { arrangeToken: number }) {
  const { fitView } = useReactFlow();
  const ready = useNodesInitialized();
  useEffect(() => {
    if (!arrangeToken || !ready) return;
    const frame = window.requestAnimationFrame(() => {
      fitView({ padding: 0.28, duration: 450, maxZoom: 1, minZoom: 0.08 });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [arrangeToken, fitView, ready]);
  return (
    <div className="absolute top-3 right-3 z-10">
      <Button
        size="sm"
        variant="secondary"
        className="rounded-full"
        onClick={() => fitView({ padding: 0.28, duration: 500, maxZoom: 1, minZoom: 0.08 })}
      >
        Center
      </Button>
    </div>
  );
}
