import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import BrandLogo, { BrandMark } from "./components/BrandLogo";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "AI Sales Companion | Every Conversation Makes You Grow",
  description:
    "Create an AI-powered sales assistant in minutes. Generate knowledge automatically and deploy to LINE and your website—no coding required.",
};

type IconName =
  | "sparkles"
  | "description"
  | "image"
  | "website"
  | "knowledge"
  | "line"
  | "widget"
  | "refresh"
  | "clock"
  | "heart"
  | "rocket"
  | "check";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    sparkles: <path d="m12 3-1.2 3.1a3 3 0 0 1-1.7 1.7L6 9l3.1 1.2a3 3 0 0 1 1.7 1.7L12 15l1.2-3.1a3 3 0 0 1 1.7-1.7L18 9l-3.1-1.2a3 3 0 0 1-1.7-1.7L12 3ZM5 15l-.6 1.4A2.7 2.7 0 0 1 3 17.8l-1 .4 1 .4A2.7 2.7 0 0 1 4.4 20L5 21.5l.6-1.5A2.7 2.7 0 0 1 7 18.6l1-.4-1-.4a2.7 2.7 0 0 1-1.4-1.4L5 15Z" />,
    description: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
    website: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9s-1.1 6.5-3.3 9c-2.2-2.5-3.3-5.5-3.3-9S9.8 5.5 12 3Z" /></>,
    knowledge: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /><path d="M8 7h8M8 11h6" /></>,
    line: <><path d="M21 11.5c0 4.4-4 8-9 8-.8 0-1.6-.1-2.3-.3L5 21l1.4-3.5C4.3 16 3 13.8 3 11.5c0-4.4 4-8 9-8s9 3.6 9 8Z" /><path d="M7.5 10v3M10 10v3M13 10v3l2.5-3v3M17 10h-1.5v3H17" /></>,
    widget: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 8h18M7 6h.01M10 6h.01" /><path d="M9 12h6v4H9z" /></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M6.1 9a7 7 0 0 1 11.7-2.6L20 12M4 12l2.2 5.6A7 7 0 0 0 17.9 15" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    rocket: <><path d="M4.5 16.5c-1.4 1.2-1.9 4-1.9 4s2.8-.5 4-1.9c.8-.7.8-1.9.1-2.6a1.7 1.7 0 0 0-2.2.5Z" /><path d="m9 15-3-3s.5-3.2 2-4.7C10.5 4.8 15 3 21 3c0 6-1.8 10.5-4.3 13-1.5 1.5-4.7 2-4.7 2l-3-3Z" /><circle cx="15" cy="9" r="2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const steps = [
  {
    number: "01",
    title: "Tell AI about your business",
    text: "Share a business description, upload photos, or add your website URL.",
    items: ["Business description", "Upload photos", "Website URL"],
  },
  {
    number: "02",
    title: "AI builds your assistant",
    text: "Your business knowledge is organized automatically and ready to use.",
    items: ["FAQs", "Knowledge Base", "AI Prompt"],
  },
  {
    number: "03",
    title: "Deploy instantly",
    text: "Connect the channels your customers already use. Your assistant is ready.",
    items: ["LINE Official Account", "Website Widget"],
  },
];

const features: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "sparkles", title: "AI Knowledge Generation", text: "Automatically creates FAQs from your business." },
  { icon: "website", title: "Website Learning", text: "Import knowledge directly from your website." },
  { icon: "image", title: "Image Understanding", text: "Generate knowledge from product or store photos." },
  { icon: "line", title: "LINE Integration", text: "Answer customers automatically on LINE." },
  { icon: "widget", title: "Website Chat Widget", text: "Add AI chat to your website with one script." },
  { icon: "refresh", title: "Continuous Learning", text: "Refresh knowledge whenever your website changes." },
];

const benefits: Array<{ icon: IconName; title: string; text: string }> = [
  { icon: "clock", title: "Save Time", text: "Reduce repetitive customer questions." },
  { icon: "heart", title: "Better Customer Experience", text: "Customers get instant answers 24/7." },
  { icon: "rocket", title: "Launch in Minutes", text: "No coding required." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-950 selection:bg-blue-200 dark:bg-slate-950 dark:text-white dark:selection:bg-blue-800">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <nav className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <BrandLogo href="#hero" markClassName="h-10 w-10 shrink-0 drop-shadow-[0_8px_16px_rgba(79,70,229,0.22)]" />
          <div className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
            <Link href="#how-it-works" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white">How it works</Link>
            <Link href="#features" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white">Features</Link>
            <Link href="/login" className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-white/10 dark:hover:text-white">Sign in</Link>
          </div>
          <Link href="/register" className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-100 sm:px-5">Get Started Free</Link>
        </nav>
      </header>

      <main className="overflow-hidden">
        <section id="hero" className={`relative isolate ${styles.heroGrid}`}>
          <div className="absolute inset-x-0 top-0 -z-20 h-[760px] bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_82%_20%,rgba(139,92,246,0.16),transparent_36%),linear-gradient(180deg,#eff6ff_0%,#ffffff_76%)] dark:bg-[radial-gradient(circle_at_18%_12%,rgba(59,130,246,0.2),transparent_34%),radial-gradient(circle_at_82%_20%,rgba(139,92,246,0.16),transparent_36%),linear-gradient(180deg,#0f172a_0%,#020617_76%)]" />
          <div className="mx-auto grid max-w-6xl gap-16 px-4 pb-24 pt-16 sm:px-6 sm:pt-22 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8 lg:pb-30 lg:pt-28">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/75 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" /></span>
                OpenAI Build Week · MVP
              </div>
              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">Every Conversation Makes You Grow</p>
              <h1 className="mt-4 max-w-3xl text-[2.9rem] font-semibold leading-[1.03] tracking-[-0.05em] sm:text-6xl lg:text-[4.5rem]">
                AI Sales Companion <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-blue-300 dark:via-indigo-300 dark:to-violet-300">for Every Business</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg font-medium leading-8 text-slate-700 dark:text-slate-200">Create an AI-powered sales assistant in minutes.</p>
              <p className="mt-2 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">Describe your business, upload a few photos, or share your website. AI builds your knowledge and answers customers through LINE and your website.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(37,99,235,0.34)]">Get Started Free <span aria-hidden="true">→</span></Link>
                <Link href="/chat-test" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/75 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:border-blue-300 hover:text-blue-700 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-blue-400 dark:hover:text-blue-300"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[8px] text-white dark:bg-white dark:text-slate-950">▶</span> Live Demo</Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {["No coding", "LINE + Website", "Ready in minutes"].map((item) => <span key={item} className="flex items-center gap-1.5"><Icon name="check" className="h-4 w-4 text-blue-600 dark:text-blue-400" />{item}</span>)}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-2xl">
              <div className="absolute -inset-10 -z-10 rounded-full bg-blue-500/15 blur-3xl" />
              <div className="rounded-[2rem] border border-white/80 bg-white/65 p-3 shadow-[0_35px_100px_rgba(30,64,175,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 sm:p-7 dark:border-white/10 dark:bg-slate-900/90">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-5 dark:border-white/10">
                    <div className="flex items-center gap-3"><BrandMark className="h-11 w-11 shrink-0 drop-shadow-[0_8px_16px_rgba(79,70,229,0.2)]" /><div><p className="text-sm font-bold">AI Sales Companion</p><p className="text-[11px] text-emerald-600 dark:text-emerald-400">● Ready to learn</p></div></div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">No code</span>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                    <div className={`${styles.floatSoft} rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Your business</p>
                      <div className="mt-4 space-y-2">
                        {[["description", "Description"], ["image", "Photos"], ["website", "Website"]].map(([icon, label]) => <div key={label} className="flex items-center gap-3 rounded-xl bg-white p-3 text-xs font-medium shadow-sm dark:bg-white/[0.07]"><Icon name={icon as IconName} className="h-4 w-4 text-blue-600 dark:text-blue-400" />{label}</div>)}
                      </div>
                    </div>
                    <div className="flex items-center justify-center"><span className={`${styles.flowArrow} flex h-9 w-9 rotate-90 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25 sm:rotate-0`}>→</span></div>
                    <div className={`${styles.floatSoftDelay} rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 p-4 text-white shadow-xl shadow-blue-600/20`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">AI builds knowledge</p>
                      <div className="mt-4 space-y-2">
                        {["FAQs", "Knowledge Base", "AI Prompt"].map((label) => <div key={label} className="flex items-center gap-3 rounded-xl bg-white/12 p-3 text-xs font-medium"><Icon name="check" className="h-4 w-4 text-blue-100" />{label}</div>)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300"><Icon name="line" className="h-5 w-5" />LINE OA</div>
                    <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800 dark:border-blue-400/15 dark:bg-blue-400/10 dark:text-blue-300"><Icon name="widget" className="h-5 w-5" />Website</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-slate-200 bg-slate-50/70 py-24 dark:border-white/10 dark:bg-white/[0.025] lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">How it works</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">From business knowledge to live assistant in 3 steps</h2></div>
            <div className="relative mt-14 grid gap-5 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-blue-300 dark:border-blue-500/30 md:block" />
              {steps.map((step) => <article key={step.number} className="relative rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_10px_35px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-white/[0.04]"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20">{step.number}</span><h3 className="mt-7 text-xl font-semibold tracking-tight">{step.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{step.text}</p><ul className="mt-5 space-y-2 text-sm text-slate-700 dark:text-slate-300">{step.items.map((item) => <li key={item} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-blue-600 dark:text-blue-400" />{item}</li>)}</ul></article>)}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">Everything you need</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Simple tools. Powerful AI.</h2><p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">Create knowledge automatically and meet customers on the channels they already use.</p></div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => <article key={feature.title} className="group rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-blue-400/30"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index % 2 ? "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300" : "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"}`}><Icon name={feature.icon} className="h-6 w-6" /></span><h3 className="mt-6 text-lg font-semibold tracking-tight">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{feature.text}</p></article>)}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50/70 py-24 dark:border-white/10 dark:bg-white/[0.025] lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">Why AI Sales Companion</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">More time for your customers</h2></div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {benefits.map((benefit) => <article key={benefit.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-7 text-center shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:border-white/10 dark:bg-white/[0.04]"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><Icon name={benefit.icon} className="h-6 w-6" /></span><h3 className="mt-5 text-lg font-semibold">{benefit.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{benefit.text}</p></article>)}
            </div>
          </div>
        </section>

        <section id="cta" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-28">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 px-6 py-16 text-center text-white shadow-[0_30px_90px_rgba(67,56,202,0.25)] sm:px-10 lg:py-20">
            <div className={`absolute inset-0 opacity-20 ${styles.ctaGrid}`} />
            <div className="relative mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">Every Conversation Makes You Grow</p><h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Ready to build your AI Sales Companion?</h2><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-blue-100">Create your first assistant for free today.</p><Link href="/register" className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-blue-800 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50">Get Started Free</Link></div>
          </div>
        </section>
      </main>
    </div>
  );
}
