"use client";

import { createPortal } from "react-dom";
import type { RelationshipType } from "@/lib/types";

const ACTIONS: { type: RelationshipType; label: string }[] = [
  { type: "son", label: "Add a son" },
  { type: "daughter", label: "Add a daughter" },
  { type: "father", label: "Add a father" },
  { type: "mother", label: "Add a mother" },
  { type: "husband", label: "Add a husband" },
  { type: "wife", label: "Add a wife" },
  { type: "brother", label: "Add a brother" },
  { type: "sister", label: "Add a sister" },
  { type: "grandfather", label: "Add a grandfather" },
  { type: "grandmother", label: "Add a grandmother" },
  { type: "grandson", label: "Add a grandson" },
  { type: "granddaughter", label: "Add a granddaughter" },
  { type: "uncle", label: "Add an uncle" },
  { type: "aunt", label: "Add an aunt" },
  { type: "nephew", label: "Add a nephew" },
  { type: "niece", label: "Add a niece" },
  { type: "cousin", label: "Add a cousin" },
];

export function NodeContextMenu({
  name,
  x,
  y,
  onAdd,
  onEdit,
  onClose,
}: {
  name: string;
  x: number;
  y: number;
  onAdd: (type: RelationshipType) => void;
  onEdit: () => void;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;
  const width = 224;
  const maxH = Math.min(420, window.innerHeight - 16);
  const left = Math.min(Math.max(8, x), window.innerWidth - width - 8);
  const top = Math.min(Math.max(8, y), window.innerHeight - maxH - 8);
  return createPortal(
    <>
      <button type="button" className="fixed inset-0 z-[190]" aria-label="Close menu" onClick={onClose} onContextMenu={(e) => e.preventDefault()} />
      <div
        role="menu"
        className="gold-border nowheel nopan fixed z-[191] flex w-56 flex-col overflow-hidden rounded-2xl border bg-[#fbf6ec] shadow-2xl"
        style={{ left, top, maxHeight: maxH }}
        onWheel={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-gold/30 px-3 py-2">
          <p className="text-[11px] tracking-wide text-gold uppercase">{name}</p>
          <button
            type="button"
            role="menuitem"
            className="mt-1 block w-full rounded-lg px-2 py-2 text-left text-sm text-maroon hover:bg-maroon/10"
            onClick={onEdit}
          >
            Edit details
          </button>
        </div>
        <p className="shrink-0 px-3 pt-2 pb-1 text-[11px] tracking-wide text-gold uppercase">Add related</p>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-2">
          {ACTIONS.map((action) => (
            <button
              key={action.type}
              type="button"
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-maroon hover:bg-maroon/10"
              onClick={() => onAdd(action.type)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </>,
    document.body
  );
}
