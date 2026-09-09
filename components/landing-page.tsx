"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { BanyanTree } from "@/components/banyan-tree";
import { FamilyStats } from "@/components/family-stats";
import { useFamilyStore } from "@/store/family-store";

export function LandingPage() {
  const { scrollYProgress } = useScroll();
  const reveal = useTransform(scrollYProgress, [0, 0.35], [0.35, 1]);
  const familyName = useFamilyStore((s) => s.familyName);

  return (
    <div>
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <svg className="h-full w-full" viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden>
            <path d="M0 40 H400" stroke="#c4a35a" strokeWidth="0.4" opacity="0.4" />
            <path d="M20 0 V200" stroke="#6b1d2a" strokeWidth="0.3" opacity="0.25" />
            <circle cx="40" cy="40" r="12" fill="none" stroke="#c4a35a" strokeWidth="0.4" />
            <circle cx="360" cy="40" r="12" fill="none" stroke="#c4a35a" strokeWidth="0.4" />
          </svg>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm tracking-[0.35em] text-gold uppercase"
        >
          {familyName}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="font-heading mt-4 max-w-3xl text-5xl leading-[1.1] text-maroon md:text-7xl"
        >
          Every family has a story.
          <br />
          Discover yours.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-5 max-w-xl text-lg text-muted-foreground"
        >
          Trace the roots. Celebrate the bonds. Preserve the legacy.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Link
            href="/tree"
            className="inline-flex h-10 items-center rounded-full bg-maroon px-6 text-sm text-ivory hover:bg-maroon/90"
          >
            Explore the Family Tree
          </Link>
          <Link
            href="/settings"
            className="inline-flex h-10 items-center rounded-full border border-gold px-6 text-sm hover:bg-secondary"
          >
            Begin Your Family Story
          </Link>
        </motion.div>
        <motion.div style={{ opacity: reveal }} className="mt-6 w-full">
          <BanyanReveal />
        </motion.div>
        <p className="mt-2 max-w-md text-xs tracking-wide text-muted-foreground">
          Roots for the ancestors · trunk for the lineage · branches for generations · leaves for each name we still speak
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <FamilyStats />
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-24 md:grid-cols-3">
        {[
          { href: "/generations", title: "Our Generations", copy: "Walk the line from great-great-grandparents to the child still learning names." },
          { href: "/heritage", title: "Our Heritage", copy: "Mysuru courtyards, Dasara returns, rasam notes, and the values that outlived houses." },
          { href: "/ask", title: "Ask Your Family", copy: "The Family Guide answers only from the tree — kinship without invention." },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="gold-border rounded-2xl border bg-card/80 p-6 transition hover:-translate-y-1">
            <h2 className="font-heading text-3xl text-maroon">{c.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{c.copy}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

function BanyanReveal() {
  const { scrollYProgress } = useScroll();
  const t = useTransform(scrollYProgress, [0, 0.4], [0.4, 1]);
  return (
    <motion.div style={{ scale: useTransform(t, [0.4, 1], [0.96, 1]) }}>
      <BanyanTree reveal={1} />
    </motion.div>
  );
}
