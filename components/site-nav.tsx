"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Plus, TreeDeciduous, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-4">
        <nav className="pointer-events-auto gold-border flex w-full max-w-5xl items-center gap-2 rounded-full border border-gold/50 bg-[#fbf6ec]/90 px-3 py-2 backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2 pr-1">
            <span className="flex size-9 items-center justify-center rounded-full border border-gold/60 bg-maroon text-ivory">
              <TreeDeciduous className="size-4" />
            </span>
            <span className="font-heading hidden text-lg tracking-wide text-maroon sm:block">The Family Tree</span>
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <Link
              href="/tree"
              className={cn(
                "hidden rounded-full px-3 py-1.5 text-sm sm:inline",
                path === "/tree" ? "bg-maroon text-ivory" : "hover:bg-secondary"
              )}
            >
              Tree
            </Link>
            <Button onClick={() => setAddOpen(true)} className="rounded-full bg-maroon text-ivory hover:bg-maroon/90">
              <Plus data-icon="inline-start" />
              Add person
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </nav>
      </header>
      {open && (
        <div className="fixed inset-0 z-30 bg-[#2c1810]/40 pt-20 sm:hidden" onClick={() => setOpen(false)}>
          <div className="gold-border mx-3 rounded-2xl border bg-card p-3" onClick={(e) => e.stopPropagation()}>
            <Link href="/" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3">
              Home
            </Link>
            <Link href="/tree" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3">
              Tree
            </Link>
          </div>
        </div>
      )}
      <AddPersonDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
