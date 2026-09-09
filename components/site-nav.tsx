"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Plus, TreeDeciduous, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/tree", label: "Family Tree" },
];

export function SiteNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-4 print:hidden">
        <nav className="pointer-events-auto gold-border flex w-full max-w-6xl items-center gap-2 rounded-full border border-gold/50 bg-[#fbf6ec]/90 px-3 py-2 shadow-lg backdrop-blur-md md:px-4">
          <Link href="/" className="flex items-center gap-2 pr-2">
            <span className="flex size-9 items-center justify-center rounded-full border border-gold/60 bg-maroon text-ivory">
              <TreeDeciduous className="size-4" />
            </span>
            <span className="font-heading hidden text-lg tracking-wide text-maroon sm:block">
              The Family Tree
            </span>
          </Link>
          <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
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
            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="max-w-[10rem] truncate text-xs text-muted-foreground">{user.name || user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  Log out
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden rounded-full px-3 py-1.5 text-sm text-maroon hover:bg-secondary sm:inline">
                Log in
              </Link>
            )}
            <Button
              onClick={() => setAddOpen(true)}
              className="rounded-full bg-maroon text-ivory hover:bg-maroon/90"
            >
              <Plus data-icon="inline-start" />
              Add person
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </nav>
      </header>
      {open && (
        <div className="fixed inset-0 z-30 bg-[#2c1810]/40 pt-20 md:hidden" onClick={() => setOpen(false)}>
          <div className="gold-border mx-3 rounded-2xl border bg-card p-4" onClick={(e) => e.stopPropagation()}>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-xl px-3 py-3",
                  path === l.href ? "bg-maroon text-ivory" : "hover:bg-secondary"
                )}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <button
                className="w-full rounded-xl px-3 py-3 text-left hover:bg-secondary"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                Log out
              </button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 hover:bg-secondary">
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
      <AddPersonDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
