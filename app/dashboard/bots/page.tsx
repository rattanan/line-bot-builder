import Header from "@/app/components/Header";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getBotsByUserId } from "@/lib/bots";
import { redirect } from "next/navigation";

export default async function BotsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard/bots");

  const bots = await getBotsByUserId(user.id);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Bot workspace</span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Bots</h1>
              <p className="mt-3 text-sm text-zinc-600">Manage workspace bots and FAQ sets.</p>
            </div>
            <Link href="/dashboard/bots/new" className="rounded-full bg-[#06C755] px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
            New Bot
          </Link>
          </div>
        </div>
        <div className="grid gap-4">
          {bots.map((bot) => (
            <article key={bot.id} className="rounded-[2rem] border border-black/5 bg-white/80 p-6 shadow-[0_10px_40px_rgba(24,24,27,0.04)]">
              <h2 className="text-xl font-semibold">{bot.bot_name}</h2>
              <p className="mt-1 text-sm text-zinc-600">{bot.business_name}</p>
              <div className="mt-4 flex gap-2">
                <Link href={`/dashboard/bots/${bot.id}/knowledge`} className="rounded-full border px-4 py-2 text-sm">
                  Knowledge
                </Link>
                <Link href={`/dashboard/bots/${bot.id}/faqs`} className="rounded-full bg-[#06C755] px-4 py-2 text-sm text-white">
                  FAQs
                </Link>
                <Link href={`/dashboard/bots/${bot.id}/usage`} className="rounded-full border px-4 py-2 text-sm">
                  Usage
                </Link>
                <Link href={`/dashboard/bots/${bot.id}/settings`} className="rounded-full border px-4 py-2 text-sm">
                  Settings
                </Link>
              </div>
            </article>
          ))}
          {!bots.length && <div className="rounded-[2rem] border bg-white/80 p-10 text-sm text-zinc-500">No bots yet.</div>}
        </div>
      </main>
    </div>
  );
}
