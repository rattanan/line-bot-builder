"use client";

import { useEffect, useState } from "react";
import Header from "../components/Header";

type ChatLog = {
  userId: string;
  question: string;
  answer: string;
  source: string;
};

type SortBy = "created_at" | "user_id" | "answer_source";
type SortOrder = "asc" | "desc";

type ChatLogResponse = {
  rows: ChatLog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: SortBy;
  sortOrder: SortOrder;
};

export default function ChatLogPage() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [userId, setUserId] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async (pageOverride?: number) => {
    const targetPage = pageOverride ?? page;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: String(limit),
        sortBy,
        sortOrder,
      });

      if (userId.trim()) {
        params.set("userId", userId.trim());
      }

      const res = await fetch(`/api/chat-log?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load chat logs (${res.status})`);
      }

      const data: ChatLogResponse = await res.json();
      setLogs(data.rows);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat logs");
      setLogs([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortBy, sortOrder]);

  useEffect(() => {
    setPage(1);
  }, [userId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchLogs(1);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Chat log</span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Conversation history</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                ดูรายการแชททั้งหมดแบบเรียงตามลำดับที่ต้องการ พร้อม paging เพื่อไล่ข้อมูลย้อนหลังได้สะดวก
              </p>
            </div>
            <div className="text-sm text-zinc-500">
              {isLoading ? "Loading..." : `${total} total record(s)`}
            </div>
          </div>

          <form onSubmit={handleSearch} className="mt-8 grid gap-4 rounded-[1.5rem] border border-zinc-200 bg-white p-4 sm:grid-cols-[1.2fr_140px_160px_160px_auto]">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Search user ID</span>
              <input
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                placeholder="Leave blank to show all"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Page size</span>
              <select
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Sort by</span>
              <select
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
              >
                <option value="created_at">Created at</option>
                <option value="user_id">User ID</option>
                <option value="answer_source">Source</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-zinc-700">Order</span>
              <select
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </label>
            <button
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              Search
            </button>
          </form>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 space-y-4">
            {logs.length === 0 ? (
              <div className="rounded-[1.5rem] border border-zinc-200 bg-white px-5 py-16 text-center text-sm text-zinc-500">
                No chat logs found.
              </div>
            ) : (
              logs.map((log, idx) => (
                <article
                  key={`${log.userId}-${idx}`}
                  className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-[0_1px_0_rgba(255,255,255,0.8)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                    <div className="grid gap-1">
                      <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                        User ID
                      </span>
                      <span className="inline-flex w-fit max-w-full rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 break-all">
                        {log.userId || "-"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-medium text-white">
                        {log.source}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">#{(page - 1) * limit + idx + 1}</p>
                  </div>

                  <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Question</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-900">{log.question}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">Answer</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">{log.answer}</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isLoading}
              >
                Previous
              </button>
              <button
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages || isLoading}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
