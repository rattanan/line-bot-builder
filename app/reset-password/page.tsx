"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "../components/Header";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { setToken(new URLSearchParams(window.location.search).get("token") || ""); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    setMessage(res.ok ? "Password updated. You can sign in now." : "Reset failed");
  };
  return <div className="min-h-screen"><Header /><main className="mx-auto max-w-xl px-4 py-10"><form onSubmit={submit} className="grid gap-4 rounded-3xl border p-6"><input placeholder="New password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)}/><button>Reset password</button>{message && <p>{message}</p>}<Link href="/login">Back to login</Link></form></main></div>;
}
