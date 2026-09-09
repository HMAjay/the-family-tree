"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BanyanTree } from "@/components/banyan-tree";
import { useFamilyStore } from "@/store/family-store";

export function LandingPage() {
  const router = useRouter();
  const people = useFamilyStore((s) => s.people);
  const hasTree = people.length > 0;

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm tracking-[0.35em] text-gold uppercase"
      >
        The Family Tree
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
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => router.push("/tree")}
        className="mt-8 inline-flex h-11 items-center rounded-full bg-maroon px-8 text-sm text-ivory hover:bg-maroon/90"
      >
        {hasTree ? "Open your family tree" : "Create your family tree"}
      </motion.button>
      <div className="mt-8 w-full">
        <BanyanTree reveal={1} />
      </div>
    </section>
  );
}
