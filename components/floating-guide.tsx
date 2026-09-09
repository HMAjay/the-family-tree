"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { FamilyGuide } from "@/components/family-guide";
import { Button } from "@/components/ui/button";

export function FloatingGuide() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  if (path === "/ask") return null;
  return (
    <>
      <Button
        aria-label="Ask Your Family"
        className="fixed right-4 bottom-4 z-40 size-14 rounded-full bg-maroon text-gold shadow-xl hover:bg-maroon/90 md:right-6 md:bottom-6"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X /> : <MessageCircle />}
      </Button>
      {open && (
        <div className="gold-border fixed right-4 bottom-20 z-40 h-[min(32rem,70vh)] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-card shadow-2xl md:right-6">
          <FamilyGuide compact />
        </div>
      )}
    </>
  );
}
