"use client";

import Header from "@/app/components/Header";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type BotOption = { id: number; name: string; businessName: string };
type CountedQuestion = { question: string; count: number };
type SuggestedFAQ = { question: string; answer: string; category: string };
type Analysis = {
  topQuestions: CountedQuestion[];
  missingFAQ: CountedQuestion[];
  suggestedFAQ: SuggestedFAQ[];
  businessInsight: string[];
};
type Conversation = {
  id: number;
  botName: string | null;
  channel: "line" | "web" | "test" | "unknown";
  userId: string;
  question: string;
  answer: string;
  createdAt: string;
};

const EMPTY_ANALYSIS: Analysis = {
  topQuestions: [],
  missingFAQ: [],
  suggestedFAQ: [],
  businessInsight: [],
};

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />;
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-5 text-center text-sm leading-6 text-slate-600 dark:border-white/15 dark:bg-white/[0.035] dark:text-slate-300">
      {children}
    </div>
  );
}

export default function BusinessInsightDashboard({
  bots,
  initialBotId,
}: {
  bots: BotOption[];
  initialBotId?: number;
}) {
  const [botId, setBotId] = useState<number | null>(initialBotId ?? bots[0]?.id ?? null);
  const [total, setTotal] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [analysis, setAnalysis] = useState<Analysis>(EMPTY_ANALYSIS);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingQuestion, setGeneratingQuestion] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedBot = useMemo(() => bots.find((bot) => bot.id === botId), [botId, bots]);

  const loadDashboard = useCallback(async () => {
    if (!botId) return;
    setLoadingDashboard(true);
    setError("");
    try {
      const response = await fetch(`/api/dashboard/bots/${botId}/insights`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load conversations");
      setTotal(Number(data.totalConversations || 0));
      setConversations(data.recentConversations || []);
      setAnalysis(data.analysis || EMPTY_ANALYSIS);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load conversations");
      setTotal(0);
      setConversations([]);
    } finally {
      setLoadingDashboard(false);
    }
  }, [botId]);

  useEffect(() => {
    // Reset results when the selected bot changes, then load its fresh conversation data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnalysis(EMPTY_ANALYSIS);
    setGeneratedQuestions([]);
    setNotice("");
    loadDashboard();
  }, [loadDashboard]);

  const analyze = async () => {
    if (!botId || total === 0) return;
    setAnalyzing(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/dashboard/bots/${botId}/insights`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to analyze conversations");
      setAnalysis(data);
      setNotice("Analysis is ready. Review the suggestions before creating any FAQ.");
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : "Unable to analyze conversations");
    } finally {
      setAnalyzing(false);
    }
  };

  const generateFAQ = async (question: string) => {
    if (!botId) return;
    setGeneratingQuestion(question);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/dashboard/bots/${botId}/insights/generate-faq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to generate FAQ");
      setGeneratedQuestions((current) => [...current, question]);
      setNotice(`Draft FAQ created in ${data.category || "General"}. Publish it from Agent FAQs when ready.`);
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Unable to generate FAQ");
    } finally {
      setGeneratingQuestion(null);
    }
  };

  if (!bots.length) {
    return (
      <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <section className="app-empty-state min-h-96 p-8 sm:p-12">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#06A648]">AI Business Insight</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Create an agent to start learning</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">Insights become available after customers have conversations with one of your agents.</p>
            <Link href="/dashboard/bots/new" className="app-button-primary mt-6">Create Agent</Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="app-page-header p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">AI Business Insight</span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Turn customer questions into better answers</h1>
              <p className="mt-3 text-sm leading-6 text-zinc-600">Analyze real conversations, discover missing knowledge, and create review-ready FAQ drafts.</p>
            </div>
            <div className="grid min-w-0 gap-3 lg:w-[31rem] sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="grid min-w-0 gap-2 text-sm font-medium text-zinc-700">
                Agent
                <select
                  value={botId ?? ""}
                  onChange={(event) => setBotId(Number(event.target.value))}
                  className="w-full min-w-0 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {bots.map((bot) => <option key={bot.id} value={bot.id}>{bot.name} · {bot.businessName}</option>)}
                </select>
              </label>
              <button
                type="button"
                onClick={analyze}
                disabled={analyzing || loadingDashboard || total === 0}
                aria-busy={analyzing}
                className="app-button-primary self-end disabled:opacity-45"
              >
                {analyzing && <Spinner />}
                {analyzing ? "Analyzing…" : "Analyze Conversations"}
              </button>
            </div>
          </div>
          {error && <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {notice && <div aria-live="polite" className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-12">
          <article className="relative overflow-hidden rounded-[1.75rem] border border-blue-500 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-[0_18px_45px_rgba(37,99,235,0.22)] lg:col-span-3">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Total conversations</p>
            <p className="relative mt-5 text-5xl font-semibold tracking-tight text-white">{loadingDashboard ? "—" : total.toLocaleString()}</p>
            <p className="relative mt-3 text-sm leading-6 text-blue-100">Saved for {selectedBot?.name}</p>
          </article>

          <article className="app-card p-6 lg:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Top Questions</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">Top {analysis.topQuestions.length}</span>
            </div>
            <div className="mt-5 space-y-3">
              {analysis.topQuestions.length ? analysis.topQuestions.map((item, index) => (
                <div key={`${item.question}-${index}`} className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 last:border-0 last:pb-0 dark:border-white/10">
                  <p className="text-sm leading-5 text-slate-700 dark:text-slate-200">{item.question}</p>
                  <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm shadow-blue-600/20">{item.count}</span>
                </div>
              )) : <EmptyCard>{total ? "Run an analysis to find recurring customer questions." : "Conversations will appear after customers chat with this agent."}</EmptyCard>}
            </div>
          </article>

          <article className="app-card p-6 lg:col-span-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Business Insight</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">AI summary</span>
            </div>
            <div className="mt-5">
              {analysis.businessInsight.length ? (
                <ol className="space-y-4">
                  {analysis.businessInsight.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-700 dark:text-slate-200">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">{index + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              ) : <EmptyCard>Business opportunities and 3–5 practical recommendations will appear here.</EmptyCard>}
            </div>
          </article>
        </section>

        <section className="app-card mt-6 p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-700">Knowledge gaps</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Suggested FAQ</h2>
              <p className="mt-2 text-sm text-zinc-600">Frequently asked questions that are not covered by published FAQ.</p>
            </div>
            {botId && <Link href={`/dashboard/bots/${botId}/faqs`} className="text-sm font-medium text-blue-700 hover:underline">Review FAQ drafts →</Link>}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {analysis.missingFAQ.map((item, index) => {
              const suggested = analysis.suggestedFAQ.find((faq) => faq.question === item.question);
              const generated = generatedQuestions.includes(item.question);
              return (
                <article key={`${item.question}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 transition hover:border-blue-200 hover:bg-white hover:shadow-[0_14px_35px_rgba(37,99,235,0.08)] dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-blue-400/30 dark:hover:bg-white/[0.055]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Asked {item.count} times</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{suggested?.category || "General"}</span>
                  </div>
                  <h3 className="mt-4 font-semibold leading-6">{item.question}</h3>
                  {suggested?.answer && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{suggested.answer}</p>}
                  <button
                    type="button"
                    onClick={() => generateFAQ(item.question)}
                    disabled={generated || generatingQuestion !== null}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-white/[0.06] dark:text-white dark:hover:border-blue-400 dark:hover:text-blue-300"
                  >
                    {generatingQuestion === item.question && <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" aria-hidden="true" />}
                    {generated ? "Draft created" : generatingQuestion === item.question ? "Generating…" : "Generate FAQ"}
                  </button>
                </article>
              );
            })}
            {!analysis.missingFAQ.length && <div className="md:col-span-2"><EmptyCard>{total ? "Analyze conversations to uncover missing FAQ." : "No conversation data to analyze yet."}</EmptyCard></div>}
          </div>
        </section>

        <section className="app-card mt-6 overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-white/10 sm:px-8">
            <div>
              <h2 className="text-lg font-semibold">Conversation Log</h2>
              <p className="mt-1 text-sm text-zinc-500">Latest 20 customer conversations</p>
            </div>
            <button type="button" onClick={loadDashboard} disabled={loadingDashboard} className="app-button-outline min-h-10 px-4 py-2 text-sm disabled:opacity-50">Refresh</button>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {conversations.map((conversation) => (
              <article key={conversation.id} className="grid gap-4 px-6 py-5 sm:px-8 lg:grid-cols-[150px_1fr_1fr_150px]">
                <div>
                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium uppercase text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">{conversation.channel}</span>
                  <p className="mt-2 break-all text-xs text-slate-500 dark:text-slate-400">{conversation.userId}</p>
                </div>
                <div><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Question</p><p className="mt-2 text-sm leading-6 text-slate-900 dark:text-white">{conversation.question}</p></div>
                <div><p className="text-xs font-medium uppercase tracking-wider text-slate-400">AI Answer</p><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{conversation.answer}</p></div>
                <time className="text-xs text-slate-500 dark:text-slate-400" dateTime={conversation.createdAt}>{new Date(conversation.createdAt).toLocaleString()}</time>
              </article>
            ))}
            {!conversations.length && <div className="app-empty-state m-5 min-h-48"><h3 className="text-base font-semibold text-slate-900 dark:text-white">No conversations yet</h3><p className="mt-2 text-sm text-slate-500">Customer questions will appear here as soon as this agent starts chatting.</p></div>}
          </div>
        </section>
      </main>
    </div>
  );
}
