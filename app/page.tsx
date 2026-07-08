"use client";

import Header from "./components/Header";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lang = "th" | "en";

const copy = {
  th: {
    badge: "แพลตฟอร์มสร้าง LINE Bot แบบครบวงจร",
    title: "สร้างบอท LINE ได้เร็วขึ้น ตอบลูกค้าได้ฉลาดขึ้น",
    subtitle:
      "Line Bot Builder ช่วยคุณสร้างบอทหลายตัว จัดการ FAQ ต่อบอท เชื่อม LINE webhook และดูการใช้งานได้ในที่เดียว",
    primary: "เริ่มใช้งานฟรี",
    secondary: "ดูวิธีใช้งาน",
    stats: [
      { label: "บอทหลายตัว", value: "Multi-tenant" },
      { label: "FAQ ต่อบอท", value: "Bot scoped" },
      { label: "เครดิตใช้งาน", value: "Usage credit" },
    ],
    benefitsTitle: "ทำอะไรได้บ้าง",
    benefits: [
      "สร้าง bot ใหม่พร้อม system prompt และ FAQ เริ่มต้นได้ในไม่กี่คลิก",
      "ผูก LINE webhook แยกตาม bot เพื่อกันข้อมูลปนกัน",
      "เติมเครดิตและตรวจ usage ได้จาก dashboard เดียว",
    ],
    stepsTitle: "เริ่มต้นใช้งานง่ายๆ",
    steps: [
      { title: "1. สมัครสมาชิก", desc: "สร้างบัญชีและยืนยันอีเมลให้เรียบร้อย" },
      { title: "2. สร้าง bot", desc: "กรอกข้อมูลร้านหรือองค์กร แล้วให้ระบบช่วย generate prompt" },
      { title: "3. ใส่ LINE settings", desc: "นำ Channel Secret และ Access Token มาใส่ในหน้า settings" },
      { title: "4. เปิดใช้งาน", desc: "เพิ่ม FAQ ทดสอบ webhook และเริ่มตอบลูกค้าได้ทันที" },
    ],
    ctaTitle: "พร้อมเริ่มสร้างบอทของคุณแล้วหรือยัง?",
    ctaDesc: "สมัครใช้งานเพื่อสร้าง LINE Bot ที่ดูแลง่าย ปรับได้ตามธุรกิจของคุณ",
    footerNote: "รองรับทีมที่มีหลายบอท หลายแบรนด์ และหลาย workflow ในที่เดียว",
    langLabel: "EN",
  },
  en: {
    badge: "All-in-one LINE bot builder",
    title: "Build LINE bots faster and reply smarter",
    subtitle:
      "Line Bot Builder helps you create multiple bots, manage bot-scoped FAQs, connect LINE webhooks, and track usage in one place.",
    primary: "Get started free",
    secondary: "See how it works",
    stats: [
      { label: "Multiple bots", value: "Multi-tenant" },
      { label: "FAQ per bot", value: "Bot scoped" },
      { label: "Usage credits", value: "Usage credit" },
    ],
    benefitsTitle: "What you can do",
    benefits: [
      "Create a new bot with system prompt and starter FAQs in just a few clicks.",
      "Keep each LINE webhook isolated per bot so data never mixes.",
      "Top up credits and review usage from a single dashboard.",
    ],
    stepsTitle: "Simple setup",
    steps: [
      { title: "1. Sign up", desc: "Create an account and verify your email." },
      { title: "2. Create a bot", desc: "Add your business details and let the system generate prompts." },
      { title: "3. Add LINE settings", desc: "Paste your Channel Secret and Access Token in settings." },
      { title: "4. Go live", desc: "Add FAQs, test the webhook, and start replying to customers." },
    ],
    ctaTitle: "Ready to build your bot?",
    ctaDesc: "Create a LINE bot that is easy to manage and fits your business.",
    footerNote: "Designed for teams with multiple bots, brands, and workflows.",
    langLabel: "TH",
  },
} as const;

const featureCards = [
  {
    title: "Dashboard",
    description: "เห็นสถานะ bot, เครดิต, FAQ และ usage log ในมุมมองเดียว",
  },
  {
    title: "AI Setup Wizard",
    description: "ช่วย generate prompt, FAQ, profile prompt และ banner prompt ให้อัตโนมัติ",
  },
  {
    title: "Admin Portal",
    description: "ดูทุก user, ทุก bot, และจัดการเครดิตได้จากศูนย์กลาง",
  },
];

export default function Home() {
  const [lang, setLang] = useState<Lang>("th");

  useEffect(() => {
    const saved = window.localStorage.getItem("landing-lang");
    if (saved === "th" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("landing-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = copy[lang];
  const gradient = useMemo(
    () =>
      lang === "th"
        ? "bg-[radial-gradient(circle_at_top_left,rgba(244,244,245,0.95),white_38%,#f8fafc_100%)]"
        : "bg-[radial-gradient(circle_at_top_left,rgba(238,242,255,0.92),white_40%,#f8fafc_100%)]",
    [lang]
  );

  return (
    <div className={`min-h-screen text-zinc-950 ${gradient}`}>
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 scroll-smooth">
        <section
          id="hero"
          className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-lime-50 px-6 py-10 shadow-[0_18px_60px_rgba(24,24,27,0.08)] backdrop-blur-md sm:px-8 sm:py-12"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(6,199,85,0.08),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.02)_0%,transparent_40%,rgba(15,23,42,0.01)_100%)]" />
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-emerald-700 shadow-sm">
              {t.badge}
            </span>
            <button
              onClick={() => setLang((current) => (current === "th" ? "en" : "th"))}
              className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold tracking-[0.18em] text-emerald-700 transition-colors hover:bg-emerald-50"
              aria-label="Switch language"
            >
              {t.langLabel}
            </button>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {t.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
                {t.subtitle}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full bg-[#06C755] px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
                >
                  {t.primary}
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-3 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50"
                >
                  {t.secondary}
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {t.stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-[0_1px_0_rgba(255,255,255,0.85)]">
                    <div className="text-xs uppercase tracking-[0.18em] text-emerald-600">{item.label}</div>
                    <div className="mt-2 text-lg font-semibold">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 shadow-[0_1px_0_rgba(255,255,255,0.85)]"
                >
                  <div className="text-sm font-semibold text-emerald-900">{card.title}</div>
                  <p className="mt-2 text-sm leading-6 text-emerald-900/75">{card.description}</p>
                </div>
              ))}
              <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-[#06C755] to-emerald-600 p-6 text-white shadow-xl">
                <div className="text-xs uppercase tracking-[0.22em] text-emerald-50">{t.ctaTitle}</div>
                <p className="mt-3 text-sm leading-6 text-white/85">{t.ctaDesc}</p>
                <Link
                  href="/register"
                  className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-emerald-700 transition-transform hover:-translate-y-0.5"
                >
                  {t.primary}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-7 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-700">{t.benefitsTitle}</span>
            <ul className="mt-5 space-y-4">
              {t.benefits.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-emerald-900/80">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#06C755]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div id="steps" className="rounded-[2rem] border border-emerald-100 bg-white/90 p-7 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-700">{t.stepsTitle}</span>
            <div className="mt-5 grid gap-4">
              {t.steps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#06C755] text-sm font-semibold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-emerald-950">{step.title}</div>
                    <p className="mt-1 text-sm leading-6 text-emerald-900/75">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="mt-8 rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-[#06C755] to-emerald-600 px-7 py-8 text-white shadow-[0_18px_60px_rgba(24,24,27,0.18)]">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{t.ctaTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">{t.footerNote}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition-transform hover:-translate-y-0.5"
              >
                {t.primary}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Login
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
