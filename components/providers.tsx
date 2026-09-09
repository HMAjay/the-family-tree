"use client";

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { useFamilyStore } from "@/store/family-store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      localStorage.removeItem("the-family-tree-v1");
    } catch {
      /* ignore */
    }
    useFamilyStore.persist.rehydrate();
    useFamilyStore.getState().setHydrated();
  }, []);
  return (
    <TooltipProvider>
      <AuthProvider>{children}</AuthProvider>
    </TooltipProvider>
  );
}
