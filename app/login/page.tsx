"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import GoogleIcon from "../components/GoogleIcon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@line-bot-builder.local");
  const [password, setPassword] = useState("Demo@123456");
  const [nextPath, setNextPath] = useState("/dashboard");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Synchronize the redirect target from the browser URL after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNextPath(params.get("next") || "/dashboard");
    if (params.get("verified") === "1") setMessage("Email verified. You can sign in now.");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-4xl gap-8 lg:grid-cols-2">
          <section className="app-card p-8">
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Welcome back</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Sign in to continue</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              ใช้อีเมลและรหัสผ่าน หรือเข้าสู่ระบบด้วย Google
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/api/auth/google/start" className="app-button-outline">
                <GoogleIcon />
                Continue with Google
              </Link>
              <Link href="/register" className="app-button-outline">
                Create account
              </Link>
            </div>
          </section>

          <section className="app-card p-8">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Email</span>
                <input className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <div className="grid gap-2">
                <label htmlFor="login-password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-20 text-sm outline-none dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute inset-y-1.5 right-1.5 flex min-w-16 items-center justify-center rounded-xl px-3 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-blue-300"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <button disabled={isLoading} aria-busy={isLoading} className="app-button-primary w-full disabled:opacity-50">
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <Link href="/forgot-password">Forgot password?</Link>
                <Link href="/register">Register</Link>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
