"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";

type FAQ = {
  id: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const fetchFAQs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/faq");
      const data = await res.json();
      setFaqs(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    if (res.ok) {
      setQuestion("");
      setAnswer("");
      await fetchFAQs();
    } else {
      alert("Failed to add FAQ");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this FAQ?")) return;
    const res = await fetch(`/api/faq/${id}`, { method: "DELETE" });
    if (res.ok) await fetchFAQs();
    else alert("Delete failed");
  };

  const handleEdit = async (faq: FAQ) => {
    const newQuestion = prompt("Edit question", faq.question) ?? faq.question;
    const newAnswer = prompt("Edit answer", faq.answer) ?? faq.answer;
    const res = await fetch(`/api/faq/${faq.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
    });
    if (res.ok) await fetchFAQs();
    else alert("Update failed");
  };

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faqs;

    return faqs.filter((faq) => {
      const idMatch = String(faq.id).includes(query);
      const questionMatch = faq.question.toLowerCase().includes(query);
      const answerMatch = faq.answer.toLowerCase().includes(query);
      return idMatch || questionMatch || answerMatch;
    });
  }, [faqs, search]);

  const totalPages = Math.max(1, Math.ceil(filteredFaqs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedFaqs = filteredFaqs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm sm:p-8">
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">FAQ manager</span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Build the knowledge base</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              เพิ่มคำถามและคำตอบที่ต้องการให้เอเจนต์ใช้ตอบก่อนเข้า AI ช่วยให้ฐานความรู้ดูเป็นระบบและอ่านง่ายขึ้น
            </p>

            <form onSubmit={handleAdd} className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Question</span>
                <input
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                  placeholder="Write the question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-zinc-700">Answer</span>
                <textarea
                  className="min-h-36 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                  placeholder="Write the answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
              </label>
              <button
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                type="submit"
              >
                Add FAQ
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-black/5 bg-white/80 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 sm:px-8">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">FAQ list</h2>
                <p className="text-sm text-zinc-500">
                  {isLoading
                    ? "Loading..."
                    : `${filteredFaqs.length} item(s)${search.trim() ? " matched" : ""}`}
                </p>
              </div>
            </div>

            <div className="border-b border-zinc-200 px-6 py-4 sm:px-8">
              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-700">Search</span>
                  <input
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                    placeholder="Search question, answer, or ID"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-zinc-700">Page size</span>
                  <select
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={4}>4 per page</option>
                    <option value={6}>6 per page</option>
                    <option value={10}>10 per page</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              {filteredFaqs.length === 0 ? (
                <div className="px-6 py-16 text-center text-sm text-zinc-500 sm:px-8">
                  {search.trim() ? "No FAQ matched your search." : "No FAQ yet. Add the first entry on the left."}
                </div>
              ) : (
                pagedFaqs.map((faq) => (
                  <article key={faq.id} className="px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Question</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-900">{faq.question}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Answer</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-700">{faq.answer}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
                          ID {faq.id}
                        </span>
                        <div className="flex gap-2">
                          <button
                            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                            onClick={() => handleEdit(faq)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                            onClick={() => handleDelete(faq.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-zinc-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="text-sm text-zinc-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>
                <button
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
