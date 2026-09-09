"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const path = usePathname();
  if (path === "/tree" || path === "/print") return null;
  return (
    <footer className="mt-auto border-t border-gold/30 bg-[#3d1a20] text-[#f4ead8] print:hidden">
      <div className="mx-auto max-w-6xl px-6 py-12 text-center">
        <p className="font-heading text-3xl italic">We are because they were.</p>
        <p className="font-heading mt-6 text-xl tracking-[0.2em] uppercase">The Family Tree</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#e8d5b0]/80">
          Preserving stories. Connecting generations. Celebrating our roots.
        </p>
        <nav className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/privacy" className="hover:text-gold">Privacy</Link>
          <Link href="/login" className="hover:text-gold">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}
