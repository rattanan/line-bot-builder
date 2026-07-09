"use client";

import Header from "@/app/components/Header";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type WizardResult = {
  systemPrompt: string;
  faqs: Array<{ question: string; answer: string }>;
  profileImagePrompt: string;
  bannerImagePrompt: string;
};

type WizardStep = 1 | 2 | 3;

type DraftCandidate = {
  question: string;
  answer: string;
  category: string;
  confidenceScore: number;
  sourceType: "description" | "image" | "website";
  languageCode: string;
  sourceRef?: string;
};

const initialForm = {
  botName: "",
  websiteUrl: "",
  storeName: "",
  businessCategory: "",
  storeDescription: "",
  targetCustomers: "",
  services: "",
  openingHours: "",
  contactChannels: "",
  tone: "friendly and professional",
};

function LoadingSpinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export default function NewBotWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [form, setForm] = useState(initialForm);
  const [wizard, setWizard] = useState<WizardResult | null>(null);
  const [draftFaqs, setDraftFaqs] = useState<DraftCandidate[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canMoveToStep2 = Boolean(form.botName);
  const canGenerate = useMemo(
    () =>
      Boolean(
        form.storeName &&
          form.businessCategory &&
          form.storeDescription &&
          form.targetCustomers &&
          form.services &&
          form.openingHours &&
          form.contactChannels &&
          form.tone
      ),
    [form]
  );

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const generate = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const res = await fetch("/api/dashboard/bots/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: form.storeName,
          businessCategory: form.businessCategory,
          storeDescription: form.storeDescription,
          targetCustomers: form.targetCustomers,
          services: form.services,
          openingHours: form.openingHours,
          contactChannels: form.contactChannels,
          tone: form.tone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generate failed");
      setWizard(data);
      setDraftFaqs(
        (data.faqs || []).map((faq: { question: string; answer: string }, index: number) => ({
          question: faq.question,
          answer: faq.answer,
          category: "description",
          confidenceScore: 0.8,
          sourceType: "description",
          languageCode: "th",
          sourceRef: `description-${index + 1}`,
        }))
      );
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generate failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveBot = async () => {
    if (!wizard) return;
    setError(null);
    setIsSaving(true);
    try {
      const res = await fetch("/api/dashboard/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botName: form.botName,
          businessName: form.storeName,
          businessDescription: form.storeDescription,
          systemPrompt: wizard.systemPrompt,
          lineChannelSecret: "",
          lineChannelAccessToken: "",
          faqs: draftFaqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      const wizardRes = await fetch(`/api/dashboard/bots/${data.id}/knowledge-wizard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteUrl: form.websiteUrl || null }),
      });
      const wizardData = await wizardRes.json();
      const wizardId = wizardData.wizard?.id;
      if (wizardId) {
        if (form.websiteUrl) {
          await fetch(`/api/dashboard/bots/${data.id}/knowledge-wizard/crawl`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wizardId, websiteUrl: form.websiteUrl }),
          });
        }
        if (imageFiles.length) {
          const formData = new FormData();
          formData.append("wizardId", String(wizardId));
          imageFiles.forEach((file) => formData.append("images", file));
          await fetch(`/api/dashboard/bots/${data.id}/knowledge-wizard/images`, {
            method: "POST",
            body: formData,
          });
        }
      }
      router.push(`/dashboard/bots/${data.id}/settings`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const removeDraftFaq = (indexToRemove: number) => {
    setDraftFaqs((current) => current.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(237,255,242,0.9),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">AI Knowledge Onboarding Wizard</h1>
            <p className="mt-2 text-sm text-zinc-600">Create a bot, generate initial knowledge, and review drafts before publishing.</p>
          </div>
          <Link href="/dashboard/bots" className="rounded-full border px-4 py-2 text-sm">
            Back
          </Link>
        </div>

        <div className="mb-8 flex gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`rounded-full px-4 py-2 text-sm ${step === n ? "bg-[#06C755] text-white" : "bg-white text-zinc-500"}`}>
              Step {n}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border bg-white/90 p-6 shadow-sm">
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold">Bot identity</h2>
                <div className="mt-4 grid gap-3">
                  <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="Bot name" value={form.botName} onChange={(e) => update("botName", e.target.value)} />
                  <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="Website URL (optional)" value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} />
                  <button disabled={!canMoveToStep2} onClick={() => setStep(2)} className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white disabled:opacity-40">
                    Continue
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold">Store information</h2>
                <div className="mt-4 grid gap-3">
                  <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="ชื่อร้าน/องค์กร" value={form.storeName} onChange={(e) => update("storeName", e.target.value)} />
                  <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="Business category" value={form.businessCategory} onChange={(e) => update("businessCategory", e.target.value)} />
                  <textarea className="min-h-28 rounded-2xl border px-4 py-3 text-sm" placeholder="รายละเอียดร้าน" value={form.storeDescription} onChange={(e) => update("storeDescription", e.target.value)} />
                  <textarea className="min-h-24 rounded-2xl border px-4 py-3 text-sm" placeholder="Target customers" value={form.targetCustomers} onChange={(e) => update("targetCustomers", e.target.value)} />
                  <textarea className="min-h-24 rounded-2xl border px-4 py-3 text-sm" placeholder="บริการ/สินค้า" value={form.services} onChange={(e) => update("services", e.target.value)} />
                  <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="เวลาเปิดปิด" value={form.openingHours} onChange={(e) => update("openingHours", e.target.value)} />
                  <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="ช่องทางติดต่อ" value={form.contactChannels} onChange={(e) => update("contactChannels", e.target.value)} />
                  <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="tone การตอบ" value={form.tone} onChange={(e) => update("tone", e.target.value)} />
                  <label className="rounded-2xl border border-dashed bg-emerald-50/60 px-4 py-4 text-sm text-zinc-700">
                    Upload store images, menu, brochure, price list
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      className="mt-3 block w-full text-sm"
                      onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                    />
                    {imageFiles.length > 0 && (
                      <span className="mt-2 block text-xs text-zinc-500">
                        Selected: {imageFiles.map((file) => file.name).join(", ")}
                      </span>
                    )}
                  </label>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} type="button" className="rounded-full border px-5 py-3 text-sm">
                      Back
                    </button>
                    <button disabled={!canGenerate || isGenerating} onClick={generate} type="button" className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white disabled:opacity-40">
                      {isGenerating ? <LoadingSpinner label="กำลังสร้าง FAQ..." /> : "Generate knowledge"}
                    </button>
                  </div>
                  {isGenerating && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <div className="flex items-center gap-3">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-[#06C755]" aria-hidden="true" />
                        <div>
                          <p className="font-medium">กำลังให้ AI วิเคราะห์ข้อมูลร้านและสร้าง FAQ</p>
                          <p className="mt-1 text-xs text-emerald-700">โปรดรอสักครู่ ระบบกำลังสร้างคำถาม-คำตอบเริ่มต้นให้บอทของคุณ</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-lg font-semibold">Approve FAQ</h2>
                <p className="mt-2 text-sm text-zinc-600">FAQ ที่เหลือใน Preview จะถูกบันทึกเป็น active FAQ ให้บอททันที</p>
                <div className="mt-4 grid gap-3">
                  {draftFaqs.map((faq, index) => (
                    <article
                      key={`${faq.question}-${index}`}
                      className="rounded-2xl border bg-white p-4 text-left transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{faq.question}</p>
                          <p className="mt-2 text-sm text-zinc-600">{faq.answer}</p>
                          <p className="mt-3 text-xs text-zinc-400">
                            source: {faq.sourceType} · confidence {Math.round(faq.confidenceScore * 100)}%
                          </p>
                        </div>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs">{faq.languageCode}</span>
                      </div>
                    </article>
                  ))}
                  {!draftFaqs.length && (
                    <div className="rounded-2xl border border-dashed p-6 text-sm text-zinc-500">
                      ยังไม่มี FAQ ที่จะ approve คุณสามารถย้อนกลับไป generate ใหม่ได้
                    </div>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button onClick={() => setStep(2)} type="button" className="rounded-full border px-5 py-3 text-sm">
                    Back
                  </button>
                  <button onClick={saveBot} disabled={isSaving || !draftFaqs.length} className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white disabled:opacity-40">
                    {isSaving ? "Creating bot..." : `Approve ${draftFaqs.length} FAQ & Create Bot`}
                  </button>
                  <button onClick={() => router.push("/dashboard/bots")} type="button" className="rounded-full border px-5 py-3 text-sm">
                    Skip review
                  </button>
                </div>
              </>
            )}

            {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          </section>

          <section className="rounded-[2rem] border bg-white/90 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Preview</h2>
            {!wizard ? (
              <div className="mt-4 rounded-2xl border border-dashed p-8 text-sm text-zinc-500">Generate content to preview system prompt and FAQs.</div>
            ) : (
              <div className="mt-4 grid gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">System prompt</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-2xl border p-4 text-sm leading-6">{wizard.systemPrompt}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">FAQs</p>
                  <div className="mt-2 grid gap-3">
                    {draftFaqs.map((faq, index) => (
                      <article key={`${faq.question}-${index}`} className="rounded-2xl border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{faq.question}</p>
                            <p className="mt-2 text-sm text-zinc-600">{faq.answer}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDraftFaq(index)}
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-red-200 bg-red-50 text-lg leading-none text-red-600 transition hover:bg-red-100"
                            aria-label={`Remove FAQ ${index + 1}`}
                            title="ลบ FAQ นี้"
                          >
                            ×
                          </button>
                        </div>
                      </article>
                    ))}
                    {!draftFaqs.length && <div className="rounded-2xl border border-dashed p-5 text-sm text-zinc-500">ลบ FAQ ออกหมดแล้ว</div>}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Ready to approve</p>
                  <p className="mt-2 text-sm text-zinc-600">{draftFaqs.length ? `${draftFaqs.length} FAQ(s) will be active after bot creation` : "No FAQ selected"}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
