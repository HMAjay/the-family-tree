"use client";

import Link from "next/link";
import { TreeDeciduous } from "lucide-react";

export function SiteNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-4">
      <nav className="pointer-events-auto gold-border flex w-full max-w-5xl items-center gap-2 rounded-full border border-gold/50 bg-[#fbf6ec]/90 px-3 py-2 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 pr-1">
          <span className="flex size-9 items-center justify-center rounded-full border border-gold/60 bg-maroon text-ivory">
            <TreeDeciduous className="size-4" />
          </span>
          <span className="font-heading hidden text-lg tracking-wide text-maroon sm:block">The Family Tree</span>
        </Link>
      </nav>
    </header>
  );
}
