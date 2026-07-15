"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "../components/Header";
import GoogleIcon from "../components/GoogleIcon";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setMessage("Account created. Check your email for the verification link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Create your account</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Start building your agent</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              สมัครสมาชิกเพื่อสร้างเอเจนต์ จัดการ FAQ และตั้งค่า LINE webhook ของคุณเอง
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/login" className="app-button-outline">
                Back to login
              </Link>
              <Link href="/api/auth/google/start" className="app-button-outline">
                <GoogleIcon />
                Continue with Google
              </Link>
            </div>
          </section>

          <section className="app-card p-8">
            <form onSubmit={submit} className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Full name</span>
                <input
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Email</span>
                <input
                  type="email"
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Password</span>
                <input
                  type="password"
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </label>
              {message && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <button
                disabled={isLoading}
                aria-busy={isLoading}
                className="app-button-primary w-full disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <span>Already have an account?</span>
                <Link href="/login">Sign in</Link>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
