"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Plus, TreeDeciduous, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { GlobalSearch } from "@/components/global-search";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/tree", label: "Family Tree" },
  { href: "/generations", label: "Generations" },
  { href: "/heritage", label: "Heritage" },
  { href: "/memories", label: "Memories" },
  { href: "/ask", label: "Ask Your Family" },
];

export function SiteNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-4">
        <nav className="pointer-events-auto gold-border flex w-full max-w-6xl items-center gap-2 rounded-full border border-gold/50 bg-[#fbf6ec]/90 px-3 py-2 shadow-lg backdrop-blur-md md:px-4">
          <Link href="/" className="flex items-center gap-2 pr-2">
            <span className="flex size-9 items-center justify-center rounded-full border border-gold/60 bg-maroon text-ivory">
              <TreeDeciduous className="size-4" />
            </span>
            <span className="font-heading hidden text-lg tracking-wide text-maroon sm:block">
              The Family Tree
            </span>
          </Link>
          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  path === l.href
                    ? "bg-maroon text-ivory"
                    : "text-foreground/80 hover:bg-secondary hover:text-maroon"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="rounded-full bg-maroon text-ivory hover:bg-maroon/90"
            >
              <Plus data-icon="inline-start" />
              <span className="hidden sm:inline">Add Family Member</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </nav>
      </header>
      {open && (
        <div className="fixed inset-0 z-30 bg-[#2c1810]/40 pt-20 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="gold-border mx-3 rounded-2xl border bg-card p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 md:hidden">
              <GlobalSearch onNavigate={() => setOpen(false)} />
            </div>
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-3",
                    path === l.href ? "bg-maroon text-ivory" : "hover:bg-secondary"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/related" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 hover:bg-secondary">
                How Are We Related?
              </Link>
              <Link href="/settings" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 hover:bg-secondary">
                Family Settings
              </Link>
            </div>
          </div>
        </div>
      )}
      <AddPersonDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
