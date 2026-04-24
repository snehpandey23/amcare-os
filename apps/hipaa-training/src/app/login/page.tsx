"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isTrainingAuthRequired } from "@/lib/trainingConfig";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, allowRegister, user, authReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!allowRegister) setMode("login");
  }, [allowRegister]);

  if (!isTrainingAuthRequired()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-900">
        <p className="max-w-md text-center text-zinc-600 dark:text-zinc-400">
          Sign-in is not configured. Set <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">NEXT_PUBLIC_HIPAA_TRAINING_API_URL</code>{" "}
          to enable accounts, or open the{" "}
          <Link href="/" className="text-teal-600 underline">
            dashboard
          </Link>{" "}
          for local-only progress.
        </p>
      </div>
    );
  }

  if (authReady && user) {
    router.replace("/");
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "register") {
        await register(email, password, name.trim() || undefined);
      } else {
        await login(email, password);
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">HIPAA training sign in</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Use the account your organization provided. Progress syncs to the training server.
        </p>

        {allowRegister ? (
          <div className="mt-4 flex gap-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                mode === "login" ? "bg-white shadow dark:bg-zinc-900" : "text-zinc-600 dark:text-zinc-400"
              }`}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                mode === "register" ? "bg-white shadow dark:bg-zinc-900" : "text-zinc-600 dark:text-zinc-400"
              }`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-amber-800 dark:text-amber-200/90">
            Self-registration is off. Ask your administrator for an account (or enable{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-950">NEXT_PUBLIC_HIPAA_TRAINING_ALLOW_REGISTER</code>{" "}
            only if appropriate).
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "register" ? (
            <label className="block">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Full name</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
              />
            </label>
          ) : null}
          <label className="block">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Password</span>
            <input
              type="password"
              required
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </label>
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={pending || (mode === "register" && !allowRegister)}
            className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {pending ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
