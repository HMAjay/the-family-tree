"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/components/auth-provider";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { EditBondDialog } from "@/components/edit-bond-dialog";
import { EditPersonDialog } from "@/components/edit-person-dialog";
import { useFamilyStore } from "@/store/family-store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useFamilyStore.persist.rehydrate();
    useFamilyStore.getState().applySavedTreeMigration();
    useFamilyStore.getState().setHydrated();
  }, []);
  return (
    <AuthProvider>
      {children}
      <AddPersonDialog />
      <EditPersonDialog />
      <EditBondDialog />
    </AuthProvider>
  );
}
