"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";

export function AuthForm({
  mode,
  nextPath,
}: {
  mode: "login" | "signup";
  nextPath: string;
}) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { email, password } : { email, password, name }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "That did not work.");
        return;
      }
      await refresh();
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="gold-border mx-auto w-full max-w-md rounded-3xl border bg-card p-8 shadow-lg">
      <h1 className="font-heading text-4xl text-maroon">{mode === "login" ? "Welcome back" : "Create an account"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "login"
          ? "Sign in to save trees and open them from your dashboard."
          : "Saving a family tree needs an account so you can come back to it."}
      </p>
      <form
        className="mt-6 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {mode === "signup" ? (
          <label className="grid gap-1.5 text-sm">
            <Label>Your name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-xl" placeholder="How we should greet you" />
          </label>
        ) : null}
        <label className="grid gap-1.5 text-sm">
          <Label>Email</Label>
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 rounded-xl" required />
        </label>
        <label className="grid gap-1.5 text-sm">
          <Label>Password</Label>
          <Input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 rounded-xl"
            minLength={mode === "signup" ? 8 : undefined}
            required
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="h-11 rounded-full bg-maroon text-ivory" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href={`/signup?next=${encodeURIComponent(nextPath)}`} className="text-maroon underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="text-maroon underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
