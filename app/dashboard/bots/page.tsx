import Header from "@/app/components/Header";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getBotsByUserId } from "@/lib/bots";
import { redirect } from "next/navigation";
import AppIcon from "@/app/components/AppIcon";

export default async function BotsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard/bots");

  const bots = await getBotsByUserId(user.id);

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="app-page-header mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Agent workspace</span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Agents</h1>
              <p className="mt-3 text-sm text-zinc-600">Manage workspace agents and FAQ sets.</p>
            </div>
            <Link href="/dashboard/bots/new" className="app-button-primary">
            <AppIcon name="plus" className="h-4 w-4" /> New Agent
          </Link>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {bots.map((bot) => (
            <article key={bot.id} className="app-card app-card-interactive p-6">
              <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 font-semibold text-blue-700 dark:from-blue-400/15 dark:to-violet-400/15 dark:text-blue-300">{bot.bot_name.charAt(0).toUpperCase()}</span><div className="min-w-0"><h2 className="truncate text-lg font-semibold text-slate-950 dark:text-white">{bot.bot_name}</h2><p className="mt-1 truncate text-sm text-zinc-600">{bot.business_name}</p></div></div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href={`/dashboard/bots/${bot.id}/knowledge`} className="app-button-outline min-h-9 px-3 py-1.5 text-xs">
                  Knowledge
                </Link>
                <Link href={`/dashboard/bots/${bot.id}/faqs`} className="app-button-primary min-h-9 px-3 py-1.5 text-xs">
                  FAQs
                </Link>
                <Link href={`/dashboard/bots/${bot.id}/usage`} className="app-button-outline min-h-9 px-3 py-1.5 text-xs">
                  Usage
                </Link>
                <Link href={`/dashboard/insights?bot=${bot.id}`} className="app-button-secondary min-h-9 px-3 py-1.5 text-xs">
                  AI Insight
                </Link>
                <Link href={`/dashboard/bots/${bot.id}/settings`} className="app-button-outline min-h-9 px-3 py-1.5 text-xs">
                  Settings
                </Link>
              </div>
            </article>
          ))}
          {!bots.length && <div className="app-empty-state md:col-span-2 xl:col-span-3"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><AppIcon name="agents" className="h-7 w-7" /></span><h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">No agents yet</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Tell AI about your business and launch your first agent in minutes.</p><Link href="/dashboard/bots/new" className="app-button-primary mt-5"><AppIcon name="plus" className="h-4 w-4" />Create your first agent</Link></div>}
        </div>
      </main>
    </div>
  );
}
