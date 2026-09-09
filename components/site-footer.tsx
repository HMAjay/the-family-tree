"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const path = usePathname();
  if (path === "/tree" || path === "/print") return null;
  return (
    <footer className="mt-auto border-t border-gold/30 bg-[#3d1a20] px-6 py-12 text-center text-[#f4ead8] print:hidden">
      <p className="font-heading text-3xl italic">We are because they were.</p>
      <p className="mt-4 text-sm text-[#e8d5b0]/80">The Family Tree</p>
    </footer>
  );
}
