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

const initialForm = {
  botName: "",
  businessName: "",
  storeDescription: "",
  services: "",
  openingHours: "",
  contactChannels: "",
  tone: "friendly and professional",
  lineChannelSecret: "",
  lineChannelAccessToken: "",
};

export default function NewBotWizardPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [wizard, setWizard] = useState<WizardResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = useMemo(
    () =>
      Boolean(
        form.botName &&
          form.businessName &&
          form.storeDescription &&
          form.services &&
          form.openingHours &&
          form.contactChannels &&
          form.tone
      ),
    [form]
  );

  const generate = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      const res = await fetch("/api/dashboard/bots/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: form.businessName,
          storeDescription: form.storeDescription,
          services: form.services,
          openingHours: form.openingHours,
          contactChannels: form.contactChannels,
          tone: form.tone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generate failed");
      setWizard(data);
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
          businessName: form.businessName,
          businessDescription: form.storeDescription,
          systemPrompt: wizard.systemPrompt,
          lineChannelSecret: form.lineChannelSecret,
          lineChannelAccessToken: form.lineChannelAccessToken,
          faqs: wizard.faqs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push(`/dashboard/bots/${data.id}/faqs`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">AI Bot Setup Wizard</h1>
            <p className="text-sm text-zinc-600">Generate bot content and seed FAQs in one flow.</p>
          </div>
            <Link href="/dashboard/bots" className="rounded-full border px-4 py-2 text-sm">Back</Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Bot details</h2>
            <div className="mt-4 grid gap-3">
              <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="Bot name" value={form.botName} onChange={(e) => update("botName", e.target.value)} />
              <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="ชื่อร้าน/องค์กร" value={form.businessName} onChange={(e) => update("businessName", e.target.value)} />
              <textarea className="min-h-28 rounded-2xl border px-4 py-3 text-sm" placeholder="รายละเอียดร้าน" value={form.storeDescription} onChange={(e) => update("storeDescription", e.target.value)} />
              <textarea className="min-h-28 rounded-2xl border px-4 py-3 text-sm" placeholder="บริการ/สินค้า" value={form.services} onChange={(e) => update("services", e.target.value)} />
              <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="เวลาเปิดปิด" value={form.openingHours} onChange={(e) => update("openingHours", e.target.value)} />
              <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="ช่องทางติดต่อ" value={form.contactChannels} onChange={(e) => update("contactChannels", e.target.value)} />
              <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="tone การตอบ" value={form.tone} onChange={(e) => update("tone", e.target.value)} />
              <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="LINE Channel Secret" value={form.lineChannelSecret} onChange={(e) => update("lineChannelSecret", e.target.value)} />
              <input className="rounded-2xl border px-4 py-3 text-sm" placeholder="LINE Channel Access Token" value={form.lineChannelAccessToken} onChange={(e) => update("lineChannelAccessToken", e.target.value)} />
              <button disabled={!canGenerate || isGenerating} onClick={generate} type="button" className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white disabled:opacity-40">
                {isGenerating ? "Generating..." : "Generate with AI"}
              </button>
              {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            </div>
          </section>

          <section className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Preview</h2>
            {!wizard ? (
              <div className="mt-4 rounded-2xl border border-dashed p-8 text-sm text-zinc-500">Generate content to preview system prompt, FAQs, and image prompts.</div>
            ) : (
              <div className="mt-4 grid gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">System prompt</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-2xl border p-4 text-sm leading-6">{wizard.systemPrompt}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">FAQs</p>
                  <div className="mt-2 grid gap-3">
                    {wizard.faqs.map((faq, index) => (
                      <article key={`${faq.question}-${index}`} className="rounded-2xl border p-4">
                        <p className="font-medium">{faq.question}</p>
                        <p className="mt-2 text-sm text-zinc-600">{faq.answer}</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Profile image prompt</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-2xl border p-4 text-sm leading-6">{wizard.profileImagePrompt}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Banner image prompt</p>
                  <p className="mt-2 whitespace-pre-wrap rounded-2xl border p-4 text-sm leading-6">{wizard.bannerImagePrompt}</p>
                </div>
                <button onClick={saveBot} disabled={isSaving} className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white disabled:opacity-40">
                  {isSaving ? "Creating bot..." : "Create bot"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
