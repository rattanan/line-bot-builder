"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Link from "next/link";

type FAQ = {
  id: number;
  bot_id: number;
  question: string;
  answer: string;
  is_active: 0 | 1;
};

export default function BotFaqsPage({ params }: { params: Promise<{ id: string }> }) {
  const [botId, setBotId] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<FAQ | null>(null);

  useEffect(() => {
    params.then((p) => setBotId(Number(p.id)));
  }, [params]);

  const loadFaqs = async (query = "") => {
    if (!botId) return;
    const res = await fetch(`/api/dashboard/bots/${botId}/faqs${query ? `?search=${encodeURIComponent(query)}` : ""}`);
    setFaqs(await res.json());
  };

  useEffect(() => {
    if (botId) loadFaqs(search);
  }, [botId, search]);

  const activeCount = useMemo(() => faqs.filter((f) => f.is_active === 1).length, [faqs]);

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

  const removeFaq = async (faqId: number) => {
    if (!botId) return;
    if (!confirm("Delete this FAQ?")) return;
    await fetch(`/api/dashboard/bots/${botId}/faqs/${faqId}`, { method: "DELETE" });
    await loadFaqs(search);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Bot FAQs</h1>
            <p className="text-sm text-zinc-600">{activeCount} active FAQ(s)</p>
          </div>
          <Link href="/dashboard" className="rounded-full border px-4 py-2 text-sm">Back</Link>
        </div>
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={addFaq} className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Add FAQ</h2>
            <div className="mt-4 grid gap-3">
              <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="Question" value={question} onChange={(e) => setQuestion(e.target.value)} />
              <textarea className="min-h-36 rounded-2xl border px-4 py-3 text-sm" placeholder="Answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
              <button className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white">Add FAQ</button>
            </div>
          </form>
          <div className="rounded-[2rem] border bg-white/80 shadow-sm">
            <div className="border-b p-6">
              <input className="w-full rounded-2xl border px-4 py-3 text-sm" placeholder="Search FAQ" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="divide-y">
              {faqs.map((faq) => (
                <div key={faq.id} className="p-6">
                  {editing?.id === faq.id ? (
                    <div className="grid gap-3">
                      <input className="rounded-2xl border px-4 py-3 text-sm" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
                      <textarea className="min-h-28 rounded-2xl border px-4 py-3 text-sm" value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
                      <div className="flex gap-2">
                        <button type="button" onClick={saveFaq} className="rounded-full bg-[#06C755] px-4 py-2 text-sm text-white">Save</button>
                        <button type="button" onClick={() => setEditing(null)} className="rounded-full border px-4 py-2 text-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{faq.question}</p>
                          <p className="mt-2 text-sm text-zinc-600">{faq.answer}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs ${faq.is_active === 1 ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}>
                          {faq.is_active === 1 ? "active" : "inactive"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setEditing(faq)} className="rounded-full border px-4 py-2 text-sm">Edit</button>
                        <button type="button" onClick={() => toggleFaq(faq)} className="rounded-full border px-4 py-2 text-sm">
                          {faq.is_active === 1 ? "Disable" : "Enable"}
                        </button>
                        <button type="button" onClick={() => removeFaq(faq.id)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!faqs.length && <div className="p-10 text-center text-sm text-zinc-500">No FAQ found.</div>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
