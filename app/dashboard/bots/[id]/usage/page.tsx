"use client";

import Header from "@/app/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";

type UsageLog = {
  id: number;
  bot_id: number;
  line_user_id: string;
  user_message: string;
  credit_before: number;
  credit_after: number;
  status: string;
  source: string;
  created_at: string;
};

type Summary = {
  total_logs: number;
  consumed_logs: number;
  blocked_logs: number;
  faq_hits: number;
  ai_hits: number;
  fallback_hits: number;
  remaining_credit: number;
};

export default function BotUsagePage({ params }: { params: Promise<{ id: string }> }) {
  const [botId, setBotId] = useState<number | null>(null);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    params.then((p) => setBotId(Number(p.id)));
  }, [params]);

  useEffect(() => {
    if (!botId) return;
    const load = async () => {
      const res = await fetch(`/api/dashboard/bots/${botId}/usage`);
      const data = await res.json();
      setLogs(data.logs || []);
      setSummary(data.summary || null);
    };
    load();
  }, [botId]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Usage</h1>
            <p className="text-sm text-zinc-600">Credit balance and usage log for this bot.</p>
          </div>
          <Link href="/dashboard/bots" className="rounded-full border px-4 py-2 text-sm">Back</Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Remaining credit" value={summary?.remaining_credit ?? 0} />
          <StatCard label="Total messages" value={summary?.total_logs ?? 0} />
          <StatCard label="Blocked" value={summary?.blocked_logs ?? 0} />
          <StatCard label="FAQ hits" value={summary?.faq_hits ?? 0} />
          <StatCard label="AI hits" value={summary?.ai_hits ?? 0} />
          <StatCard label="Fallback hits" value={summary?.fallback_hits ?? 0} />
        </section>

        <section className="mt-8 rounded-[2rem] border bg-white/80 shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-lg font-semibold">Recent usage</h2>
          </div>
          <div className="divide-y">
            {logs.map((log) => (
              <article key={log.id} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{log.line_user_id}</p>
                    <p className="text-xs text-zinc-500">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="rounded-full bg-zinc-100 px-3 py-1">{log.status}</span>
                    <span className="rounded-full bg-[#06C755] px-3 py-1 text-white">{log.source}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-700">{log.user_message}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  credit: {log.credit_before} → {log.credit_after}
                </p>
              </article>
            ))}
            {!logs.length && <div className="p-10 text-center text-sm text-zinc-500">No usage logs yet.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
