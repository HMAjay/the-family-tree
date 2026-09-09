"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth-form";

function LoginInner() {
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  return <AuthForm mode="login" nextPath={next} />;
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] items-center px-4 pt-24 pb-16">
      <Suspense>
        <LoginInner />
      </Suspense>
    </div>
  );
}
