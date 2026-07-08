"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Demo@123456");
  const [nextPath, setNextPath] = useState("/admin");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next") || "/admin");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-4xl gap-8 lg:grid-cols-2">
          <section className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Admin access</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Sign in to manage users</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
            </p>
          </section>

          <section className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Username</span>
                <input
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Password</span>
                <input
                  type="password"
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
