"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Detail = {
  bot: {
    id: number;
    user_id: number;
    owner_email: string;
    owner_name: string;
    bot_name: string;
    business_name: string;
    business_description: string;
    system_prompt: string;
    credit_balance: number;
    status: "active" | "suspended";
    created_at: string;
    updated_at: string | null;
  };
  usageLogs: Array<{
    id: number;
    line_user_id: string;
    user_message: string;
    credit_before: number;
    credit_after: number;
    status: string;
    source: string;
    created_at: string;
  }>;
  transactions: Array<{
    id: number;
    amount: number;
    reason: string;
    admin_email: string;
    created_at: string;
  }>;
};

export default function BotDetailClient({ botId }: { botId: number }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [amount, setAmount] = useState("50");
  const [reason, setReason] = useState("admin top up");

  const load = async () => {
    const res = await fetch(`/api/admin/bots/${botId}`);
    const data = await res.json();
    setDetail(data);
  };

  useEffect(() => {
    load();
  }, [botId]);

  const submitAction = async (action: "credit" | "suspend" | "activate") => {
    await fetch(`/api/admin/bots/${botId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        amount: Number(amount),
        reason,
      }),
    });
    await load();
  };

  if (!detail) {
    return <div className="rounded-[2rem] border bg-white/80 p-8 text-sm text-zinc-500">Loading...</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{detail.bot.bot_name}</h1>
          <p className="text-sm text-zinc-600">{detail.bot.business_name}</p>
        </div>
        <Link href="/admin/bots" className="rounded-full border px-4 py-2 text-sm">Back</Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Info</h2>
          <div className="mt-4 space-y-2 text-sm text-zinc-700">
            <p>Owner: {detail.bot.owner_name}</p>
            <p>Email: {detail.bot.owner_email}</p>
            <p>Owner Credit: {detail.bot.credit_balance}</p>
            <p>Status: {detail.bot.status}</p>
            <p className="whitespace-pre-wrap">{detail.bot.business_description}</p>
          </div>
        </div>

        <div className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Actions</h2>
          <div className="mt-4 grid gap-3">
            <input className="rounded-2xl border px-4 py-3 text-sm" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input className="rounded-2xl border px-4 py-3 text-sm" value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => submitAction("credit")} className="rounded-full bg-[#06C755] px-4 py-2 text-sm text-white">Add Owner Credit</button>
              <button onClick={() => submitAction("suspend")} className="rounded-full border px-4 py-2 text-sm">Suspend</button>
              <button onClick={() => submitAction("activate")} className="rounded-full border px-4 py-2 text-sm">Activate</button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Usage log</h2>
          <div className="mt-4 space-y-3">
            {detail.usageLogs.map((log) => (
              <div key={log.id} className="rounded-2xl border p-4 text-sm">
                <div className="flex justify-between gap-2">
                  <span>{log.line_user_id}</span>
                  <span>{log.source}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-zinc-700">{log.user_message}</p>
                <p className="mt-2 text-xs text-zinc-500">{log.credit_before} → {log.credit_after} {log.status}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Credit transactions</h2>
          <div className="mt-4 space-y-3">
            {detail.transactions.map((tx) => (
              <div key={tx.id} className="rounded-2xl border p-4 text-sm">
                <div className="flex justify-between gap-2">
                  <span>{tx.amount > 0 ? `+${tx.amount}` : tx.amount}</span>
                  <span>{tx.admin_email}</span>
                </div>
                <p className="mt-2 text-zinc-700">{tx.reason}</p>
                <p className="mt-2 text-xs text-zinc-500">{new Date(tx.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
