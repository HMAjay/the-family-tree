"use client";

import { useEffect } from "react";
import { AddPersonDialog } from "@/components/add-person-dialog";
import { EditBondDialog } from "@/components/edit-bond-dialog";
import { useFamilyStore } from "@/store/family-store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useFamilyStore.persist.rehydrate();
    useFamilyStore.getState().setHydrated();
  }, []);
  return (
    <>
      {children}
      <AddPersonDialog />
      <EditBondDialog />
    </>
  );
}
