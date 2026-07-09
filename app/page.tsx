"use client";

import Header from "./components/Header";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "th" | "en";

const content = {
  th: {
    switchLabel: "EN",
    eyebrow: "LINE Bot Builder สำหรับทุกธุรกิจ",
    title: "ให้ AI สร้าง LINE Chat Bot ให้ธุรกิจคุณ ภายใน 5 นาที",
    subtitle: "เริ่มต้นฟรี • เติมเครดิตได้ • จ่ายเท่าที่ใช้งาน",
    intro:
      "ไม่ต้องเขียนโค้ด ไม่ต้องมีความรู้ด้าน AI เพียงบอกชื่อร้าน อธิบายธุรกิจสั้น ๆ หรืออัปโหลดรูปสินค้า/หน้าร้าน AI จะช่วยสร้างทุกอย่างให้ทันที",
    primary: "เริ่มสร้างฟรี",
    secondary: "เข้าสู่ระบบ",
    aiTitle: "AI จะช่วยสร้างอะไรให้บ้าง",
    aiItems: [
      "สร้างคำถาม-คำตอบ (FAQ) อัตโนมัติ",
      "สร้างข้อความต้อนรับลูกค้า",
      "แนะนำเมนูและการตอบแชต",
      "สร้างรูปโปรไฟล์และแบนเนอร์สำหรับ LINE OA",
      "พร้อมเชื่อมต่อกับ LINE Chat Bot ได้ในไม่กี่นาที",
    ],
    audienceTitle: "เหมาะสำหรับ",
    audiences: ["ร้านอาหาร", "ร้านกาแฟ", "คลินิก", "ร้านค้าออนไลน์", "โรงแรม", "บริษัท", "หน่วยงาน", "ธุรกิจทุกประเภท"],
    pricingTitle: "ใช้งานง่าย จ่ายเฉพาะที่ใช้",
    pricingItems: [
      "สมัครใช้งานฟรี",
      "ฟรีข้อความเริ่มต้นสำหรับทดลองใช้งาน",
      "เติมเครดิตได้ตลอดเวลา",
      "ไม่มีค่ารายเดือน จ่ายตามจำนวนข้อความที่ใช้งานจริง",
    ],
    stepsTitle: "เริ่มได้ใน 4 ขั้นตอน",
    steps: [
      ["สมัครใช้งาน", "สร้างบัญชีและยืนยันอีเมล"],
      ["บอกข้อมูลธุรกิจ", "กรอกชื่อร้าน ใส่ URL หรืออัปโหลดรูปสินค้า"],
      ["ตรวจคำตอบที่ AI สร้าง", "เลือก FAQ ที่ต้องการเปิดใช้งาน"],
      ["เชื่อมต่อ LINE OA", "นำ token ไปใส่ แล้วเริ่มตอบลูกค้า"],
    ],
    finalTitle: "ให้ AI ดูแลการตอบคำถามลูกค้า เพื่อให้คุณมีเวลาทำธุรกิจมากขึ้น",
    finalText: "เริ่มสร้าง LINE Chat Bot ของคุณวันนี้ ใช้เวลาไม่ถึง 5 นาที",
  },
  en: {
    switchLabel: "TH",
    eyebrow: "LINE Bot Builder for every business",
    title: "Let AI create a LINE Chat Bot for your business in 5 minutes",
    subtitle: "Start free • Top up credits • Pay as you use",
    intro:
      "No coding and no AI knowledge needed. Tell us your store name, describe your business, or upload product and storefront images. AI helps generate the essentials instantly.",
    primary: "Start free",
    secondary: "Login",
    aiTitle: "What AI creates for you",
    aiItems: [
      "Automatic FAQ drafts",
      "Customer greeting messages",
      "Chat response and menu suggestions",
      "Profile and banner prompts for LINE OA",
      "Ready to connect with your LINE Chat Bot in minutes",
    ],
    audienceTitle: "Built for",
    audiences: ["Restaurants", "Coffee shops", "Clinics", "Online stores", "Hotels", "Companies", "Organizations", "Any business"],
    pricingTitle: "Simple usage-based pricing",
    pricingItems: [
      "Free signup",
      "Starter messages included",
      "Top up credits any time",
      "No monthly fee, pay only for real message usage",
    ],
    stepsTitle: "Launch in 4 steps",
    steps: [
      ["Sign up", "Create your account and verify email"],
      ["Add business knowledge", "Enter store details, add a URL, or upload images"],
      ["Review AI drafts", "Approve the FAQs you want to activate"],
      ["Connect LINE OA", "Add your tokens and start serving customers"],
    ],
    finalTitle: "Let AI handle customer questions so you can spend more time growing your business",
    finalText: "Start building your LINE Chat Bot today in less than 5 minutes.",
  },
} as const;

export default function Home() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "th";
    const saved = window.localStorage.getItem("landing-lang");
    return saved === "th" || saved === "en" ? saved : "th";
  });

  useEffect(() => {
    window.localStorage.setItem("landing-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = content[lang];

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-zinc-950">
      <Header />
      <main className="overflow-hidden">
        <section id="hero" className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:pb-20 lg:pt-14">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold tracking-[0.18em] text-zinc-600">
                {t.eyebrow}
              </span>
              <button
                onClick={() => setLang((current) => (current === "th" ? "en" : "th"))}
                className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition-colors hover:border-[#06C755]"
              >
                {t.switchLabel}
              </button>
            </div>

            <h1 className="mt-8 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-zinc-950 sm:text-5xl lg:text-[4rem]">
              {t.title}
            </h1>
            <p className="mt-5 text-lg font-semibold text-[#06A847]">{t.subtitle}</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600">{t.intro}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-full bg-[#06C755] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(6,199,85,0.25)] transition-transform hover:-translate-y-0.5">
                {t.primary}
              </Link>
              <Link href="/login" className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-400">
                {t.secondary}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[2rem] bg-white/70 blur-2xl" />
            <Image
              src="/landing-ai-bot-hero.png"
              alt="AI LINE chat bot helping a business answer customers"
              width={1400}
              height={900}
              priority
              className="relative w-full rounded-[28px] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(39,39,42,0.12)]"
            />
          </div>
        </section>

        <section id="features" className="border-y border-zinc-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#06A847]">{t.aiTitle}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-zinc-950">
                AI เตรียมฐานความรู้ให้พร้อมใช้งาน
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {t.aiItems.map((item) => (
                <div key={item} className="rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 text-sm leading-6 text-zinc-700">
                  <span className="mr-2 text-[#06C755]">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="audience" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#06A847]">{t.audienceTitle}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal">ธุรกิจทุกแบบที่ต้องตอบลูกค้าซ้ำ ๆ</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {t.audiences.map((item) => (
                <span key={item} className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[#111827] text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#80F0A6]">{t.pricingTitle}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal">{t.finalTitle}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {t.pricingItems.map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/6 p-4 text-sm leading-6 text-white/82">
                  <span className="mr-2 text-[#80F0A6]">•</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="steps" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#06A847]">{t.stepsTitle}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal">ง่ายพอให้เริ่มวันนี้</h2>
            </div>
            <Link href="/register" className="w-fit rounded-full bg-[#06C755] px-5 py-3 text-sm font-semibold text-white">
              {t.primary}
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {t.steps.map(([title, desc], index) => (
              <div key={title} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">{index + 1}</div>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-zinc-200 bg-white px-6 py-8 shadow-[0_18px_60px_rgba(39,39,42,0.08)] sm:px-8 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-normal">{t.finalText}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{t.subtitle}</p>
            </div>
            <Link href="/register" className="mt-6 inline-flex rounded-full bg-[#06C755] px-6 py-3 text-sm font-semibold text-white lg:mt-0">
              {t.primary}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
