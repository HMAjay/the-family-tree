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
  const left = Math.min(x, window.innerWidth - 220);
  const top = Math.min(y, window.innerHeight - 360);
  return createPortal(
    <>
      <button type="button" className="fixed inset-0 z-[190]" aria-label="Close menu" onClick={onClose} onContextMenu={(e) => e.preventDefault()} />
      <div
        role="menu"
        className="gold-border fixed z-[191] w-52 overflow-hidden rounded-2xl border bg-[#fbf6ec] py-2 shadow-2xl"
        style={{ left, top }}
      >
        <p className="px-3 pb-1.5 text-[11px] tracking-wide text-gold uppercase">{name}</p>
        <button
          type="button"
          role="menuitem"
          className="block w-full px-3 py-2 text-left text-sm text-maroon hover:bg-maroon/10"
          onClick={onEdit}
        >
          Edit details
        </button>
        <div className="my-1 border-t border-gold/30" />
        <p className="px-3 pb-1 pt-1 text-[11px] tracking-wide text-gold uppercase">Add related</p>
        {ACTIONS.map((action) => (
          <button
            key={action.type}
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-sm text-maroon hover:bg-maroon/10"
            onClick={() => onAdd(action.type)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}
