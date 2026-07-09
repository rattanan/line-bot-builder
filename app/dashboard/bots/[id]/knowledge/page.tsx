"use client";

import Header from "@/app/components/Header";
import { mergeCandidatesByNormalizedQuestion } from "@/lib/knowledge-merger";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Candidate = {
  id: number;
  bot_id: number;
  wizard_id: number;
  question: string;
  answer: string;
  category: string | null;
  confidence_score: number;
  source_type: "description" | "image" | "website";
  source_ref: string | null;
  language_code: string;
  status: "draft" | "approved" | "rejected" | "merged";
  created_at: string;
  updated_at: string | null;
};

type Wizard = {
  id: number;
  bot_id: number;
  user_id: number;
  website_url: string | null;
  status: string;
};

function InlineSpinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export default function BotKnowledgeReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [botId, setBotId] = useState<number | null>(null);
  const [wizard, setWizard] = useState<Wizard | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    params.then((p) => setBotId(Number(p.id)));
  }, [params]);

  const load = useCallback(async () => {
    if (!botId) return;
    const wizardRes = await fetch(`/api/dashboard/bots/${botId}/knowledge-wizard`);
    const wizardData = await wizardRes.json();
    setWizard(wizardData.wizard || null);
    setWebsiteUrl(wizardData.wizard?.website_url || "");
    if (!wizardData.wizard?.id) {
      setCandidates([]);
      return;
    }
    const res = await fetch(`/api/dashboard/bots/${botId}/knowledge-wizard/review?wizardId=${wizardData.wizard.id}`);
    const data = await res.json();
    setCandidates(data.rawCandidates || []);
  }, [botId]);

  const runWebsiteImport = async () => {
    if (!botId || !wizard?.id || !websiteUrl.trim()) return;
    setSyncing(true);
    setMessage("");
    try {
      const res = await fetch(`/api/dashboard/bots/${botId}/knowledge-wizard/crawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wizardId: wizard.id, websiteUrl: websiteUrl.trim() }),
      });
      const data = await res.json();
      setMessage(res.status === 202 ? "กำลังดึงข้อมูลจากเว็บไซต์ใน background" : data.error || "เริ่ม crawl ไม่สำเร็จ");
    } finally {
      setSyncing(false);
    }
  };

  const uploadImages = async () => {
    if (!botId || !wizard?.id || !imageFiles.length) return;
    setSyncing(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("wizardId", String(wizard.id));
      imageFiles.forEach((file) => form.append("images", file));
      const res = await fetch(`/api/dashboard/bots/${botId}/knowledge-wizard/images`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      setMessage(res.status === 202 ? `อัปโหลดรูปแล้ว ${data.uploaded || 0} ไฟล์ กำลังประมวลผล background` : data.error || "อัปโหลดไม่สำเร็จ");
      setImageFiles([]);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const merged = useMemo(() => mergeCandidatesByNormalizedQuestion(candidates), [candidates]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return merged;
    return merged.filter((candidate) =>
      candidate.question.toLowerCase().includes(q) ||
      candidate.answer.toLowerCase().includes(q) ||
      String(candidate.category || "").toLowerCase().includes(q) ||
      candidate.source_type.toLowerCase().includes(q)
    );
  }, [merged, search]);

  const approveSelected = async () => {
    if (!botId || !selected.length) return;
    setLoading(true);
    setMessage("");
    try {
      for (const id of selected) {
        await fetch(`/api/dashboard/bots/${botId}/knowledge-wizard/review`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approveCandidateId: id }),
        });
      }
      setMessage("อนุมัติ FAQ ที่เลือกแล้ว");
      setSelected([]);
      await load();
    } finally {
      setLoading(false);
    }
  };

  const deleteCandidate = async (id: number) => {
    if (!botId) return;
    if (!confirm("Delete this draft FAQ?")) return;
    await fetch(`/api/dashboard/bots/${botId}/knowledge-wizard/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteCandidateId: id }),
    });
    await load();
  };

  const toggleSelect = (id: number) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Knowledge Review</h1>
            <p className="text-sm text-zinc-600">Review draft FAQs before publishing them to the bot.</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/bots/${botId || ""}/faqs`} className="rounded-full border px-4 py-2 text-sm">
              Bot FAQs
            </Link>
            <Link href={`/dashboard/bots/${botId || ""}/settings`} className="rounded-full border px-4 py-2 text-sm">
              Bot Setting
            </Link>
          </div>
        </div>

        <div className="mb-4 rounded-[2rem] border bg-white/80 p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-3">
              <div className="text-sm text-zinc-600">
                {wizard ? (
                  <>
                    Wizard #{wizard.id} · Status: {wizard.status}
                  </>
                ) : (
                  "No wizard found yet"
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={runWebsiteImport}
                  disabled={!websiteUrl.trim() || syncing}
                  className="rounded-full bg-[#06C755] px-4 py-2 text-sm text-white disabled:opacity-40"
                >
                  {syncing ? <InlineSpinner label="กำลังทำงาน..." /> : websiteUrl.trim() ? "Start website import" : "No website URL"}
                </button>
                <label className="cursor-pointer rounded-full border px-4 py-2 text-sm">
                  Upload images
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                  />
                </label>
                <button
                  onClick={uploadImages}
                  disabled={!imageFiles.length || syncing}
                  className="rounded-full bg-zinc-950 px-4 py-2 text-sm text-white disabled:opacity-40"
                >
                  {imageFiles.length ? `Send ${imageFiles.length} image(s)` : "Choose images first"}
                </button>
                <button onClick={load} className="rounded-full border px-4 py-2 text-sm">
                  Refresh results
                </button>
              </div>
              {imageFiles.length > 0 && (
                <div className="rounded-2xl border bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
                  Selected images: {imageFiles.map((file) => file.name).join(", ")}
                </div>
              )}
              <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4">
                <label className="grid gap-2 text-sm">
                  <span className="font-medium text-zinc-700">Website URL for import</span>
                  <input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="rounded-2xl border border-zinc-200 px-4 py-3 text-sm outline-none"
                  />
                </label>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  แก้ URL ได้ตรงนี้ แล้วกด Start website import เพื่อดึงข้อมูลจากเว็บใหม่เข้ามาได้ทันที
                </p>
              </div>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search draft FAQ"
              className="w-full rounded-2xl border px-4 py-3 text-sm"
            />
          </div>
          {syncing && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <div className="flex items-center gap-3">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-[#06C755]" aria-hidden="true" />
                <div>
                  <p className="font-medium">กำลังประมวลผลข้อมูลเพื่อสร้าง FAQ</p>
                  <p className="mt-1 text-xs text-emerald-700">ระบบกำลังอ่านข้อมูลจากเว็บไซต์หรือรูปภาพ แล้วสร้าง draft FAQ ให้ตรวจทาน</p>
                </div>
              </div>
            </div>
          )}
          {message && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button onClick={approveSelected} disabled={loading || !selected.length} className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white disabled:opacity-40">
            {loading ? "Saving..." : `Approve selected (${selected.length})`}
          </button>
          <button onClick={() => router.push(`/dashboard/bots/${botId}/settings`)} className="rounded-full border px-5 py-3 text-sm">
            Go to Bot Setting
          </button>
        </div>

        <div className="grid gap-4">
          {filtered.map((candidate) => {
            const isSelected = selected.includes(candidate.id);
            const sourceRows = candidates.filter((row) => row.question.toLowerCase().trim() === candidate.question.toLowerCase().trim());
            return (
              <article
                key={candidate.id}
                className={`rounded-[2rem] border bg-white/80 p-6 shadow-sm ${isSelected ? "border-[#06C755]" : "border-black/5"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(candidate.id)} className="mt-1 h-4 w-4 accent-[#06C755]" />
                    <div>
                      <h2 className="text-lg font-semibold">{candidate.question}</h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-700">{candidate.answer}</p>
                    </div>
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-zinc-100 px-3 py-1">{candidate.source_type}</span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">{Math.round(Number(candidate.confidence_score) * 100)}%</span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1">{candidate.language_code}</span>
                  </div>
                </div>

                <details className="mt-4 rounded-2xl border bg-zinc-50 p-4">
                  <summary className="cursor-pointer text-sm font-medium">Source details</summary>
                  <div className="mt-3 grid gap-2 text-sm text-zinc-700">
                    <p>Category: {candidate.category || "-"}</p>
                    <p>Source: {candidate.source_type}</p>
                    <p>Ref: {candidate.source_ref || "-"}</p>
                    <p>Status: {candidate.status}</p>
                    <p>Sources merged for this question: {sourceRows.length}</p>
                    <div className="mt-2 space-y-2">
                      {sourceRows.map((row) => (
                        <div key={row.id} className="rounded-2xl border bg-white px-4 py-3 text-xs text-zinc-600">
                          #{row.id} · {row.source_type} · {row.source_ref || "-"} · {row.status}
                        </div>
                      ))}
                    </div>
                  </div>
                </details>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => toggleSelect(candidate.id)} className="rounded-full border px-4 py-2 text-sm">
                    {isSelected ? "Unselect" : "Select"}
                  </button>
                  <button type="button" onClick={() => deleteCandidate(candidate.id)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
          {!filtered.length && <div className="rounded-[2rem] border bg-white/80 p-10 text-center text-sm text-zinc-500">No draft FAQ found.</div>}
        </div>
      </main>
    </div>
  );
}
