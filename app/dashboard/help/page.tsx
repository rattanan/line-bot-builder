"use client";

import Header from "@/app/components/Header";
import AppIcon, { type AppIconName } from "@/app/components/AppIcon";
import { type AppLanguage, useLanguage } from "@/app/components/LanguageProvider";
import Link from "next/link";
import { useMemo, useState } from "react";

type Localized = Record<AppLanguage, string>;
type Category = "all" | "getting-started" | "knowledge" | "channels" | "insights" | "billing" | "account";

type HelpFAQ = {
  category: Exclude<Category, "all">;
  question: Localized;
  answer: Localized;
};

const categories: Array<{ id: Category; label: Localized }> = [
  { id: "all", label: { en: "All topics", th: "ทุกหัวข้อ" } },
  { id: "getting-started", label: { en: "Getting started", th: "เริ่มต้นใช้งาน" } },
  { id: "knowledge", label: { en: "Knowledge & FAQs", th: "คลังความรู้และ FAQ" } },
  { id: "channels", label: { en: "LINE & Website", th: "LINE และเว็บไซต์" } },
  { id: "insights", label: { en: "Business Insight", th: "ข้อมูลเชิงลึกธุรกิจ" } },
  { id: "billing", label: { en: "Credits & Billing", th: "เครดิตและการชำระเงิน" } },
  { id: "account", label: { en: "Account", th: "บัญชีผู้ใช้" } },
];

const quickGuides: Array<{ icon: AppIconName; title: Localized; description: Localized; href: string; action: Localized }> = [
  {
    icon: "agents",
    title: { en: "Create your first agent", th: "สร้างเอเจนต์แรก" },
    description: { en: "Describe your business and let AI prepare the first knowledge set.", th: "อธิบายธุรกิจของคุณ แล้วให้ AI เตรียมคลังความรู้ชุดแรก" },
    href: "/dashboard/bots/new",
    action: { en: "Create agent", th: "สร้างเอเจนต์" },
  },
  {
    icon: "book",
    title: { en: "Build better knowledge", th: "สร้างคลังความรู้ที่ดีขึ้น" },
    description: { en: "Add a description, product photos, a website, or manual FAQs.", th: "เพิ่มคำอธิบาย รูปสินค้า เว็บไซต์ หรือ FAQ ด้วยตนเอง" },
    href: "/dashboard/bots",
    action: { en: "Manage agents", th: "จัดการเอเจนต์" },
  },
  {
    icon: "settings",
    title: { en: "Deploy to customer channels", th: "เชื่อมต่อช่องทางลูกค้า" },
    description: { en: "Open an agent to configure LINE OA and copy the website widget code.", th: "เปิดเอเจนต์เพื่อตั้งค่า LINE OA และคัดลอกโค้ดวิดเจ็ตเว็บไซต์" },
    href: "/dashboard/bots",
    action: { en: "Open deployment", th: "ตั้งค่าการเชื่อมต่อ" },
  },
  {
    icon: "sparkles",
    title: { en: "Learn from conversations", th: "เรียนรู้จากบทสนทนา" },
    description: { en: "Analyze customer questions and turn knowledge gaps into FAQ drafts.", th: "วิเคราะห์คำถามลูกค้าและเปลี่ยนช่องว่างความรู้เป็น FAQ ฉบับร่าง" },
    href: "/dashboard/insights",
    action: { en: "View insights", th: "ดูข้อมูลเชิงลึก" },
  },
];

const faqItems: HelpFAQ[] = [
  {
    category: "getting-started",
    question: { en: "How do I create an AI Sales Agent?", th: "ฉันจะสร้าง AI Sales Agent ได้อย่างไร?" },
    answer: { en: "Select New Agent, enter an agent name and business information, then choose how AI should learn: business description, photos, or a website. Review the generated knowledge before publishing it.", th: "เลือกสร้างเอเจนต์ กรอกชื่อเอเจนต์และข้อมูลธุรกิจ จากนั้นเลือกแหล่งเรียนรู้ เช่น คำอธิบายธุรกิจ รูปภาพ หรือเว็บไซต์ แล้วตรวจสอบความรู้ที่ AI สร้างก่อนเผยแพร่" },
  },
  {
    category: "getting-started",
    question: { en: "Can one account manage multiple agents?", th: "หนึ่งบัญชีจัดการหลายเอเจนต์ได้หรือไม่?" },
    answer: { en: "Yes. Each agent has separate business knowledge, FAQs, channel settings, usage, conversation history, and insights.", th: "ได้ แต่ละเอเจนต์มีคลังความรู้ FAQ การตั้งค่าช่องทาง การใช้งาน ประวัติการสนทนา และข้อมูลเชิงลึกแยกจากกัน" },
  },
  {
    category: "knowledge",
    question: { en: "What information can AI learn from?", th: "AI เรียนรู้จากข้อมูลอะไรได้บ้าง?" },
    answer: { en: "AI can generate knowledge from a business description, uploaded product or store photos, website content, and FAQs entered manually.", th: "AI สามารถสร้างความรู้จากคำอธิบายธุรกิจ รูปสินค้าและร้านค้า เนื้อหาบนเว็บไซต์ และ FAQ ที่เพิ่มด้วยตนเอง" },
  },
  {
    category: "knowledge",
    question: { en: "Why is a generated FAQ saved as a draft?", th: "ทำไม FAQ ที่ AI สร้างจึงเป็นฉบับร่าง?" },
    answer: { en: "Draft status gives you a review checkpoint. AI-generated answers do not become available to customers until you approve and publish them.", th: "สถานะฉบับร่างช่วยให้คุณตรวจสอบก่อน คำตอบที่ AI สร้างจะยังไม่แสดงต่อลูกค้าจนกว่าคุณจะอนุมัติและเผยแพร่" },
  },
  {
    category: "knowledge",
    question: { en: "How do I update an incorrect answer?", th: "ฉันจะแก้ไขคำตอบที่ไม่ถูกต้องได้อย่างไร?" },
    answer: { en: "Open the agent, go to FAQ Management, select Edit, update the question or answer, and save. You can also disable an FAQ without deleting it.", th: "เปิดเอเจนต์ ไปที่จัดการ FAQ เลือกแก้ไข ปรับคำถามหรือคำตอบ แล้วบันทึก คุณสามารถปิดใช้งาน FAQ โดยไม่ต้องลบได้ด้วย" },
  },
  {
    category: "channels",
    question: { en: "How do I connect LINE Official Account?", th: "ฉันจะเชื่อมต่อ LINE Official Account ได้อย่างไร?" },
    answer: { en: "Open Agent Settings, add the Channel Secret and Channel Access Token from LINE Developers, save the connection, copy the generated webhook URL into LINE, enable Use webhook, then run Test Connection.", th: "เปิดตั้งค่าเอเจนต์ เพิ่ม Channel Secret และ Channel Access Token จาก LINE Developers บันทึกการเชื่อมต่อ คัดลอก Webhook URL ไปใส่ใน LINE เปิด Use webhook แล้วกดทดสอบการเชื่อมต่อ" },
  },
  {
    category: "channels",
    question: { en: "How do I install the website chat widget?", th: "ฉันจะติดตั้งวิดเจ็ตแชทบนเว็บไซต์ได้อย่างไร?" },
    answer: { en: "Open Agent Settings, copy the Website Chat Widget embed code, and place it before the closing body tag on your website. One script is enough for each site.", th: "เปิดตั้งค่าเอเจนต์ คัดลอกโค้ด Website Chat Widget แล้ววางก่อนแท็กปิด body บนเว็บไซต์ ใช้เพียงหนึ่งสคริปต์ต่อเว็บไซต์" },
  },
  {
    category: "channels",
    question: { en: "Where can I test an agent before deployment?", th: "ฉันทดสอบเอเจนต์ก่อนนำไปใช้งานได้ที่ไหน?" },
    answer: { en: "Use Live Demo to test the web chat experience. Confirm that published FAQs answer correctly before sharing the widget or enabling the LINE webhook.", th: "ใช้หน้าทดลองใช้งานเพื่อทดสอบประสบการณ์เว็บแชท ตรวจสอบว่า FAQ ที่เผยแพร่ตอบได้ถูกต้องก่อนแชร์วิดเจ็ตหรือเปิด LINE webhook" },
  },
  {
    category: "insights",
    question: { en: "What does AI Business Insight analyze?", th: "AI Business Insight วิเคราะห์อะไรบ้าง?" },
    answer: { en: "It analyzes saved customer conversations for recurring questions, gaps not covered by published FAQs, suggested FAQ drafts, and 3–5 practical business recommendations.", th: "ระบบวิเคราะห์บทสนทนาลูกค้าที่บันทึกไว้ เพื่อหาคำถามที่พบบ่อย ช่องว่างที่ FAQ ยังไม่ครอบคลุม FAQ ฉบับร่างที่แนะนำ และข้อเสนอแนะทางธุรกิจ 3–5 ข้อ" },
  },
  {
    category: "insights",
    question: { en: "Will analysis automatically change my live agent?", th: "การวิเคราะห์จะเปลี่ยนเอเจนต์ที่ใช้งานอยู่โดยอัตโนมัติหรือไม่?" },
    answer: { en: "No. Suggested FAQs are created as drafts and require manual review and approval before they affect customer answers.", th: "ไม่ FAQ ที่แนะนำจะถูกสร้างเป็นฉบับร่าง และต้องผ่านการตรวจสอบและอนุมัติด้วยตนเองก่อนมีผลต่อคำตอบลูกค้า" },
  },
  {
    category: "billing",
    question: { en: "How are credits used?", th: "เครดิตถูกใช้งานอย่างไร?" },
    answer: { en: "Credits are consumed when an agent processes customer messages according to the configured usage rules. Review each agent's Usage page for activity and remaining balance.", th: "เครดิตจะถูกใช้เมื่อเอเจนต์ประมวลผลข้อความลูกค้าตามกฎการใช้งานที่กำหนด ตรวจสอบกิจกรรมและยอดคงเหลือได้ที่หน้าการใช้งานของแต่ละเอเจนต์" },
  },
  {
    category: "billing",
    question: { en: "How do I add credits?", th: "ฉันจะเติมเครดิตได้อย่างไร?" },
    answer: { en: "Open Credits & Billing, choose a package, create an order, scan PromptPay, and upload the payment slip before the order expires. You can follow the status in Billing History.", th: "เปิดเครดิตและการชำระเงิน เลือกแพ็กเกจ สร้างรายการ สแกน PromptPay และอัปโหลดสลิปก่อนรายการหมดอายุ จากนั้นติดตามสถานะได้ในประวัติการชำระเงิน" },
  },
  {
    category: "account",
    question: { en: "Can I sign in with Google?", th: "ฉันเข้าสู่ระบบด้วย Google ได้หรือไม่?" },
    answer: { en: "Yes. Select Continue with Google on the login or registration page. Email and password sign-in remains available as well.", th: "ได้ เลือก Continue with Google ที่หน้าเข้าสู่ระบบหรือสมัครสมาชิก และยังสามารถใช้อีเมลกับรหัสผ่านได้เช่นกัน" },
  },
  {
    category: "account",
    question: { en: "How do I reset my password?", th: "ฉันจะรีเซ็ตรหัสผ่านได้อย่างไร?" },
    answer: { en: "Select Forgot password on the login page, enter your registered email, then follow the reset link sent to your inbox.", th: "เลือก ลืมรหัสผ่าน ที่หน้าเข้าสู่ระบบ กรอกอีเมลที่ลงทะเบียน แล้วทำตามลิงก์รีเซ็ตที่ส่งไปยังกล่องจดหมาย" },
  },
];

export default function HelpPage() {
  const { language, text } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("all");

  const filteredFAQs = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return faqItems.filter((item) => {
      const matchesCategory = category === "all" || item.category === category;
      const searchableContent = `${item.question.en} ${item.answer.en} ${item.question.th} ${item.answer.th}`.toLocaleLowerCase();
      const matchesQuery = !normalizedQuery || searchableContent.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="min-h-screen bg-transparent text-slate-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="app-page-header relative overflow-hidden p-6 sm:p-9">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><AppIcon name="help" /></span><p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">{text("Help Center", "ศูนย์ช่วยเหลือ")}</p></div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{text("How can we help?", "เราช่วยอะไรคุณได้บ้าง?")}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{text("Find setup guides, deployment instructions, and answers for every part of AI Sales Companion.", "ค้นหาคู่มือการตั้งค่า วิธีเชื่อมต่อช่องทาง และคำตอบสำหรับทุกส่วนของ AI Sales Companion")}</p>
            <label className="relative mt-6 block max-w-2xl"><span className="sr-only">{text("Search help", "ค้นหาความช่วยเหลือ")}</span><AppIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text("Search guides and FAQs", "ค้นหาคู่มือและคำถามที่พบบ่อย")} className="w-full py-3.5 pl-12 pr-4 text-sm" /></label>
          </div>
        </section>

        <section className="mt-8" aria-labelledby="quick-guides-title">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">{text("Quick guides", "คู่มือด่วน")}</p>
          <h2 id="quick-guides-title" className="mt-2 text-2xl font-semibold tracking-tight">{text("Move from setup to learning", "เริ่มตั้งค่าจนถึงเรียนรู้จากลูกค้า")}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickGuides.map((guide) => (
              <Link key={guide.title.en} href={guide.href} className="app-card app-card-interactive group flex min-h-64 flex-col p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><AppIcon name={guide.icon} /></span>
                <h3 className="mt-5 font-semibold text-slate-950 dark:text-white">{guide.title[language]}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{guide.description[language]}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">{guide.action[language]}<AppIcon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="app-card mt-8 overflow-hidden" aria-labelledby="faq-title">
          <div className="border-b border-slate-200 px-6 py-6 dark:border-white/10 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">{text("System FAQ", "คำถามเกี่ยวกับระบบ")}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="faq-title" className="text-2xl font-semibold tracking-tight">{text("Frequently asked questions", "คำถามที่พบบ่อย")}</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{language === "th" ? `พบ ${filteredFAQs.length} คำตอบ` : `${filteredFAQs.length} answer${filteredFAQs.length === 1 ? "" : "s"}`}</p></div>{(query || category !== "all") && <button type="button" onClick={() => { setQuery(""); setCategory("all"); }} className="app-button-outline min-h-10 w-fit px-4 py-2 text-sm">{text("Clear filters", "ล้างตัวกรอง")}</button>}</div>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label={text("Help categories", "หมวดหมู่ความช่วยเหลือ")}>
              {categories.map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.id)} aria-pressed={category === item.id} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${category === item.id ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"}`}>{item.label[language]}</button>)}
            </div>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {filteredFAQs.map((item) => (
              <details key={item.question.en} className="group px-6 py-1 sm:px-8">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-sm font-semibold text-slate-900 dark:text-white"><span>{item.question[language]}</span><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-open:rotate-45 group-open:bg-blue-50 group-open:text-blue-700 dark:bg-white/[0.06] dark:text-slate-300 dark:group-open:bg-blue-400/10 dark:group-open:text-blue-300"><AppIcon name="plus" className="h-4 w-4" /></span></summary>
                <p className="max-w-4xl pb-5 pr-10 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.answer[language]}</p>
              </details>
            ))}
            {!filteredFAQs.length && <div className="app-empty-state m-5 min-h-56"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><AppIcon name="search" /></span><h3 className="mt-4 font-semibold text-slate-950 dark:text-white">{text("No help articles found", "ไม่พบบทความช่วยเหลือ")}</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{text("Try another keyword or clear the current filters.", "ลองใช้คำค้นอื่นหรือล้างตัวกรองปัจจุบัน")}</p></div>}
          </div>
        </section>

        <section className="mt-8 rounded-[1.75rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-7 text-white shadow-[0_18px_45px_rgba(37,99,235,0.2)] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">{text("Still need help?", "ยังต้องการความช่วยเหลือ?")}</p><h2 className="mt-2 text-2xl font-semibold">{text("Test the experience or review your agents", "ทดลองใช้งานหรือตรวจสอบเอเจนต์ของคุณ")}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">{text("Use Live Demo to reproduce an answer, then update the agent's knowledge or channel settings.", "ใช้หน้าทดลองเพื่อทดสอบคำตอบ จากนั้นอัปเดตคลังความรู้หรือการตั้งค่าช่องทางของเอเจนต์")}</p></div>
          <div className="mt-5 flex shrink-0 flex-wrap gap-3 sm:mt-0"><Link href="/chat-test" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50">{text("Open Live Demo", "เปิดหน้าทดลอง")}</Link><Link href="/dashboard/bots" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/20">{text("Manage agents", "จัดการเอเจนต์")}</Link></div>
        </section>
      </main>
    </div>
  );
}
