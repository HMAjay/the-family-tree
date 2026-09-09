"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth-provider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/tree";
  const intent = params.get("intent");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const intentCopy =
    intent === "print"
      ? "Sign in to print your family tree."
      : intent === "save"
        ? "Sign in to save your family tree on this website."
        : "Your tree can be built freely. Saving and printing require an account.";

  return (
    <div className="mx-auto max-w-md px-4 py-28">
      <h1 className="font-heading text-5xl text-maroon">
        {mode === "login" ? "Welcome back" : "Create an account"}
      </h1>
      <p className="mt-3 text-muted-foreground">{intentCopy}</p>
      <form
        className="mt-8 grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError(null);
          const err =
            mode === "login" ? await login(email, password) : await register(name, email, password);
          setPending(false);
          if (err) {
            setError(err);
            return;
          }
          router.push(next);
        }}
      >
        {mode === "register" && (
          <label className="grid gap-1 text-sm">
            <Label>Your name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ananya Sharma" />
          </label>
        )}
        <label className="grid gap-1 text-sm">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="grid gap-1 text-sm">
          <Label>Password</Label>
          <Input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="At least 8 characters"
          />
        </label>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending} className="rounded-full bg-maroon text-ivory">
          {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link className="text-maroon underline" href={`/register?next=${encodeURIComponent(next)}${intent ? `&intent=${intent}` : ""}`}>
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link className="text-maroon underline" href={`/login?next=${encodeURIComponent(next)}${intent ? `&intent=${intent}` : ""}`}>
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
