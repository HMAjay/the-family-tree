"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BanyanTree } from "@/components/banyan-tree";
import { useFamilyStore } from "@/store/family-store";

export function LandingPage() {
  const router = useRouter();
  const startEmpty = useFamilyStore((s) => s.startEmpty);

  return (
    <div>
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
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => {
              startEmpty();
              router.push("/tree");
            }}
            className="inline-flex h-10 items-center rounded-full bg-maroon px-6 text-sm text-ivory hover:bg-maroon/90"
          >
            Start an empty tree
          </button>
          <Link
            href="/login?next=/tree"
            className="inline-flex h-10 items-center rounded-full border border-gold px-6 text-sm hover:bg-secondary"
          >
            Log in to save or print
          </Link>
        </motion.div>
        <div className="mt-6 w-full">
          <BanyanTree reveal={1} />
        </div>
        <p className="mt-2 max-w-md text-xs tracking-wide text-muted-foreground">
          Begin with one ancestor. Log in when you are ready to save or print.
        </p>
      </section>
    </div>
  );
}
