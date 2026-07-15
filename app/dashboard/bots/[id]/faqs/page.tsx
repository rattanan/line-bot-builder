"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";

type FAQ = {
  id: number;
  bot_id: number;
  question: string;
  answer: string;
  is_active: 0 | 1;
  faq_status?: "draft" | "active" | "archived";
  source_meta?: string | null;
};

const pageSize = 8;

export default function BotFaqsPage({ params }: { params: Promise<{ id: string }> }) {
  const { language, text } = useLanguage();
  const [botId, setBotId] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    params.then((p) => setBotId(Number(p.id)));
  }, [params]);

  const loadFaqs = useCallback(async (query = "") => {
    if (!botId) return;
    const res = await fetch(`/api/dashboard/bots/${botId}/faqs${query ? `?search=${encodeURIComponent(query)}` : ""}`);
    setFaqs(await res.json());
  }, [botId]);

  useEffect(() => {
    // Fetching the selected agent's FAQ list synchronizes this page with the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (botId) loadFaqs(search);
  }, [botId, loadFaqs, search]);

  const activeCount = useMemo(() => faqs.filter((f) => f.is_active === 1 && f.faq_status !== "draft" && f.faq_status !== "archived").length, [faqs]);
  const pageCount = Math.max(1, Math.ceil(faqs.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleFaqs = useMemo(() => faqs.slice((safePage - 1) * pageSize, safePage * pageSize), [faqs, safePage]);
  const rangeStart = faqs.length ? (safePage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(safePage * pageSize, faqs.length);

  const goToPage = (nextPage: number) => {
    setEditing(null);
    setPage(Math.max(1, Math.min(pageCount, nextPage)));
  };

  const addFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botId) return;
    await fetch(`/api/dashboard/bots/${botId}/faqs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    setQuestion("");
    setAnswer("");
    await loadFaqs(search);
  };

  const saveFaq = async () => {
    if (!botId || !editing) return;
    await fetch(`/api/dashboard/bots/${botId}/faqs/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: editing.question, answer: editing.answer, isActive: editing.is_active === 1 }),
    });
    setEditing(null);
    await loadFaqs(search);
  };

  const toggleFaq = async (faq: FAQ) => {
    if (!botId) return;
    await fetch(`/api/dashboard/bots/${botId}/faqs/${faq.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !(faq.is_active === 1) }),
    });
    await loadFaqs(search);
  };

  const publishFaq = async (faq: FAQ) => {
    if (!botId) return;
    await fetch(`/api/dashboard/bots/${botId}/faqs/${faq.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faqStatus: "active" }),
    });
    await loadFaqs(search);
  };

  const removeFaq = async (faqId: number) => {
    if (!botId) return;
    if (!confirm("Delete this FAQ?")) return;
    await fetch(`/api/dashboard/bots/${botId}/faqs/${faqId}`, { method: "DELETE" });
    await loadFaqs(search);
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="app-page-header mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Agent FAQs</h1>
            <p className="text-sm text-zinc-600">{activeCount} active FAQ(s)</p>
          </div>
          <Link href="/dashboard/bots" className="app-button-outline">Back to agents</Link>
        </div>
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={addFaq} className="app-card h-fit p-6">
            <h2 className="text-lg font-semibold">Add FAQ</h2>
            <div className="mt-4 grid gap-3">
              <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
              <textarea className="min-h-36 rounded-2xl border px-4 py-3 text-sm" placeholder="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
              <button className="app-button-primary">Add FAQ</button>
            </div>
          </form>
          <div className="app-card overflow-hidden">
            <div className="border-b p-6">
              <input className="w-full rounded-2xl border px-4 py-3 text-sm" placeholder="Search FAQ" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); setEditing(null); }} />
            </div>
            <div className="divide-y">
              {visibleFaqs.map((faq) => (
                <div key={faq.id} className="p-6">
                  {editing?.id === faq.id ? (
                    <div className="grid gap-3">
                      <input className="rounded-2xl border px-4 py-3 text-sm" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
                      <textarea className="min-h-28 rounded-2xl border px-4 py-3 text-sm" value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
                      <div className="flex gap-2">
                        <button type="button" onClick={saveFaq} className="app-button-primary min-h-9 px-3 py-1.5 text-xs">Save</button>
                        <button type="button" onClick={() => setEditing(null)} className="app-button-outline min-h-9 px-3 py-1.5 text-xs">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{faq.question}</p>
                          <p className="mt-2 text-sm text-zinc-600">{faq.answer}</p>
                          {faq.source_meta && (() => {
                            try {
                              const meta = JSON.parse(faq.source_meta) as { category?: string; source?: string };
                              return meta.source === "business_insight" ? <p className="mt-2 text-xs font-medium text-emerald-700">AI Business Insight · {meta.category || "General"}</p> : null;
                            } catch {
                              return null;
                            }
                          })()}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs ${faq.is_active === 1 ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                          {faq.faq_status || (faq.is_active === 1 ? "active" : "inactive")}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {faq.faq_status === "draft" && (
                          <button type="button" onClick={() => publishFaq(faq)} className="app-button-primary min-h-9 px-3 py-1.5 text-xs">Publish</button>
                        )}
                        <button type="button" onClick={() => setEditing(faq)} className="app-button-outline min-h-9 px-3 py-1.5 text-xs">Edit</button>
                        {faq.faq_status !== "draft" && (
                          <button type="button" onClick={() => toggleFaq(faq)} className="app-button-outline min-h-9 px-3 py-1.5 text-xs">
                            {faq.is_active === 1 ? "Disable" : "Enable"}
                          </button>
                        )}
                        <button type="button" onClick={() => removeFaq(faq.id)} className="app-button-danger min-h-9 px-3 py-1.5 text-xs">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!faqs.length && <div className="app-empty-state m-5 min-h-48"><h3 className="text-base font-semibold text-slate-900 dark:text-white">No FAQ found</h3><p className="mt-2 text-sm text-slate-500">Add a question manually or generate knowledge for this agent.</p></div>}
            </div>
            {!!faqs.length && (
              <nav className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between" aria-label={text("FAQ pagination", "การแบ่งหน้า FAQ")}>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === "th" ? `แสดง ${rangeStart}–${rangeEnd} จาก ${faqs.length} รายการ` : `Showing ${rangeStart}–${rangeEnd} of ${faqs.length} FAQs`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                    className="app-button-outline min-h-9 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    {text("Previous", "ก่อนหน้า")}
                  </button>
                  <span className="min-w-24 text-center text-xs font-medium text-slate-600 dark:text-slate-300" aria-live="polite">
                    {text("Page", "หน้า")} {safePage} {text("of", "จาก")} {pageCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === pageCount}
                    className="app-button-outline min-h-9 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    {text("Next", "ถัดไป")}
                  </button>
                </div>
              </nav>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
