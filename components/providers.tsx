"use client";

import { useEffect } from "react";
import { useFamilyStore } from "@/store/family-store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useFamilyStore.persist.rehydrate();
    useFamilyStore.getState().setHydrated();
  }, []);
  return <>{children}</>;
}
