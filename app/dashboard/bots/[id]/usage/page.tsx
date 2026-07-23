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
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="app-page-header mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Usage</h1>
            <p className="text-sm text-zinc-600">Account credit balance and usage log for this agent.</p>
          </div>
          <Link href="/dashboard/bots" className="app-button-outline">Back to agents</Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Account credit" value={summary?.remaining_credit ?? 0} />
          <StatCard label="Total messages" value={summary?.total_logs ?? 0} />
          <StatCard label="Blocked" value={summary?.blocked_logs ?? 0} />
          <StatCard label="FAQ hits" value={summary?.faq_hits ?? 0} />
          <StatCard label="AI hits" value={summary?.ai_hits ?? 0} />
          <StatCard label="Fallback hits" value={summary?.fallback_hits ?? 0} />
        </section>

        <section className="mt-8 app-card overflow-hidden">
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
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100">{log.status}</span>
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-white">{log.source}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-700">{log.user_message}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  credit: {log.credit_before} → {log.credit_after}
                </p>
              </article>
            ))}
            {!logs.length && <div className="app-empty-state m-5 min-h-48"><h3 className="text-base font-semibold text-slate-900 dark:text-white">No usage yet</h3><p className="mt-2 text-sm text-slate-500">Customer messages and credit activity will appear here.</p></div>}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="app-card p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
