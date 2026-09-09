"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TreeDeciduous } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteNav() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-4">
      <nav className="pointer-events-auto gold-border flex w-full max-w-5xl items-center gap-2 rounded-full border border-gold/50 bg-[#fbf6ec]/90 px-3 py-2 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 pr-1">
          <span className="flex size-9 items-center justify-center rounded-full border border-gold/60 bg-maroon text-ivory">
            <TreeDeciduous className="size-4" />
          </span>
          <span className="font-heading hidden text-lg tracking-wide text-maroon sm:block">The Family Tree</span>
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {loading ? (
            <span className="px-2 text-xs text-muted-foreground">…</span>
          ) : user ? (
            <>
              <Link href="/dashboard" className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "rounded-full")}>
                Trees
              </Link>
              <span className="hidden max-w-[10rem] truncate px-1 text-xs text-muted-foreground sm:inline">{user.email}</span>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  void logout().then(() => router.push("/"));
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "rounded-full")}>
                Log in
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ size: "sm" }), "rounded-full bg-maroon text-ivory")}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
