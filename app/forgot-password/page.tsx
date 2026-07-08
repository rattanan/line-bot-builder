"use client";
import Link from "next/link";
import { useState } from "react";
import Header from "../components/Header";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setMessage("If the email exists, a reset link was sent.");
  };
  return <div className="min-h-screen"><Header /><main className="mx-auto max-w-xl px-4 py-10"><form onSubmit={submit} className="grid gap-4 rounded-3xl border p-6"><input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}/><button>Send reset link</button>{message && <p>{message}</p>}<Link href="/login">Back to login</Link></form></main></div>;
}
