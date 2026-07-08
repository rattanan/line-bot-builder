import Header from "./components/Header";
import Link from "next/link";

const cards = [
  {
    title: "Chat Test",
    description: "ลองคุยกับบอทและดูคำตอบที่ระบบสร้างให้แบบเรียลไทม์",
    href: "/chat-test",
    accent: "from-sky-50 to-white",
  },
  {
    title: "FAQ",
    description: "จัดการคำถามที่พบบ่อยสำหรับฐานความรู้ของระบบ",
    href: "/faq",
    accent: "from-emerald-50 to-white",
  },
  {
    title: "Chat Log",
    description: "ดูประวัติการสนทนาและตรวจสอบ source ของคำตอบ",
    href: "/chat-log",
    accent: "from-zinc-100 to-white",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="max-w-2xl">
            <span className="inline-flex rounded-full border border-black/5 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500 shadow-sm">
              Legal bot workspace
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Clean, calm, and focused tools for support and mediation.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
              หน้าหลักนี้รวมทุกเครื่องมือไว้ในโทนเรียบ โปร่ง และอ่านง่าย เพื่อให้เข้าถึง
              chat test, FAQ และ chat log ได้เร็วขึ้นโดยไม่รกสายตา
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/chat-test"
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                Open Chat Test
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
              >
                Manage FAQ
              </Link>
            </div>
          </section>

          <section className="grid gap-4">
            {cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group rounded-3xl border border-black/5 bg-gradient-to-br ${card.accent} p-6 shadow-[0_1px_0_rgba(255,255,255,0.8)] transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">{card.title}</h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600">{card.description}</p>
                  </div>
                  <span className="rounded-full border border-black/5 bg-white px-3 py-1 text-xs font-medium text-zinc-500 transition-colors group-hover:text-zinc-950">
                    Open
                  </span>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
