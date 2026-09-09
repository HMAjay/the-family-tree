import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gold/30 bg-[#3d1a20] text-[#f4ead8] print:hidden">
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="font-heading text-3xl italic md:text-4xl">We are because they were.</p>
        <div className="ornament-line mx-auto my-8 max-w-xs" />
        <p className="font-heading text-2xl tracking-[0.2em] uppercase">The Family Tree</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-[#e8d5b0]/80">
          Preserving stories. Connecting generations. Celebrating our roots.
        </p>
        <nav className="mt-10 flex flex-wrap justify-center gap-6 text-sm">
          <Link href="/privacy" className="hover:text-gold">Privacy</Link>
          <Link href="/about" className="hover:text-gold">About</Link>
          <Link href="/settings" className="hover:text-gold">Family Settings</Link>
          <Link href="/contact" className="hover:text-gold">Contact</Link>
          <Link href="/related" className="hover:text-gold">How Are We Related?</Link>
          <Link href="/login" className="hover:text-gold">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}
