"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth-form";

function SignupInner() {
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";
  return <AuthForm mode="signup" nextPath={next} />;
}

export default function SignupPage() {
  return (
    <div className="flex min-h-[100dvh] items-center px-4 pt-24 pb-16">
      <Suspense>
        <SignupInner />
      </Suspense>
    </div>
  );
}
