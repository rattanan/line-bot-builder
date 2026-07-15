"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "../components/Header";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Synchronize the reset token from the browser URL after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setMessage(res.ok ? "Password updated. You can sign in now." : "Reset failed");
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-4xl gap-8 lg:grid-cols-2">
          <section className="app-card p-8">
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Reset password</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">ตั้งรหัสผ่านใหม่</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">ใส่รหัสผ่านใหม่เพื่อกลับเข้าสู่ระบบได้ทันที</p>
            <div className="mt-6 flex gap-3">
              <Link href="/login" className="app-button-outline">
                Back to login
              </Link>
              <Link href="/register" className="app-button-outline">
                Create account
              </Link>
            </div>
          </section>

          <section className="app-card p-8">
            <form onSubmit={submit} className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">New password</span>
                <input
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none"
                  placeholder="New password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="app-button-primary w-full">
                Reset password
              </button>
              {message && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
