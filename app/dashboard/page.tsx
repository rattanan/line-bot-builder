import Header from "../components/Header";
import AppIcon from "../components/AppIcon";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getBotsByUserId } from "@/lib/bots";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");
  const bots = await getBotsByUserId(user.id);
  const recentBots = bots.slice(0, 3);

  return (
    <div className="min-h-screen text-zinc-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-page-header relative overflow-hidden">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-100/70 blur-3xl dark:bg-blue-500/10" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">Workspace overview</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-4xl">Welcome back, {user.full_name}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">Your agents, knowledge and customer insights—organized in one place.</p>
            </div>
            <Link href="/dashboard/bots/new" className="app-button-primary w-full sm:w-auto"><AppIcon name="plus" className="h-4 w-4" />Create new agent</Link>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Workspace summary">
          {[
            { label: "Agents", value: bots.length.toLocaleString(), detail: "Ready to manage", icon: "agents" as const, tone: "blue" },
            { label: "Credit balance", value: user.credit_balance.toLocaleString(), detail: "Available messages", icon: "wallet" as const, tone: "violet" },
            { label: "Knowledge", value: bots.length ? "Connected" : "Not started", detail: bots.length ? "Agent workspaces active" : "Create your first agent", icon: "book" as const, tone: "blue" },
            { label: "Account", value: user.role, detail: user.email, icon: "settings" as const, tone: "violet" },
          ].map((item) => (
            <article key={item.label} className="app-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</p><p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{item.value}</p></div>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone === "blue" ? "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300" : "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"}`}><AppIcon name={item.icon} className="h-5 w-5" /></span>
              </div>
              <p className="mt-4 truncate text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
            </article>
          ))}
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="app-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-5 dark:border-white/10">
              <div><h2 className="text-lg font-semibold text-slate-950 dark:text-white">Recent agents</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Continue building your customer experience.</p></div>
              <Link href="/dashboard/bots" className="text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300">View all</Link>
            </div>
            {recentBots.length ? (
              <div className="divide-y divide-slate-200/70 dark:divide-white/10">
                {recentBots.map((bot) => (
                  <article key={bot.id} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-blue-50/40 dark:hover:bg-blue-400/[0.04] sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 font-semibold text-blue-700 dark:from-blue-400/15 dark:to-violet-400/15 dark:text-blue-300">{bot.bot_name.charAt(0).toUpperCase()}</span><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{bot.bot_name}</h3><p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{bot.business_name}</p></div></div>
                    <div className="flex gap-2"><Link href={`/dashboard/bots/${bot.id}/knowledge`} className="app-button-outline min-h-9 px-3 py-1.5 text-xs">Knowledge</Link><Link href={`/dashboard/bots/${bot.id}/settings`} className="app-button-outline min-h-9 px-3 py-1.5 text-xs">Settings</Link></div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="app-empty-state m-6"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><AppIcon name="agents" className="h-7 w-7" /></span><h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">Create your first agent</h3><p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">Describe your business and AI will prepare the first knowledge set for you.</p><Link href="/dashboard/bots/new" className="app-button-primary mt-5"><AppIcon name="plus" className="h-4 w-4" />Create agent</Link></div>
            )}
          </section>

          <aside className="app-card p-6">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"><AppIcon name="sparkles" /></span><div><h2 className="font-semibold text-slate-950 dark:text-white">Quick actions</h2><p className="text-xs text-slate-500 dark:text-slate-400">Jump back into your workflow.</p></div></div>
            <div className="mt-6 space-y-2">
              {([
                ["AI Business Insight", "/dashboard/insights", "sparkles"],
                ["Manage knowledge", "/dashboard/bots", "book"],
                ["Top up credits", "/dashboard/topup", "wallet"],
                ["View billing history", "/dashboard/topup/history", "history"],
              ] as const).map(([label, href, icon]) => <Link key={href} href={href} className="group flex min-h-12 items-center gap-3 rounded-xl border border-slate-200/80 px-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-blue-400/20 dark:hover:bg-blue-400/[0.06] dark:hover:text-blue-300"><AppIcon name={icon} className="h-4 w-4" /><span className="flex-1">{label}</span><AppIcon name="arrow" className="h-4 w-4 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100" /></Link>)}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
