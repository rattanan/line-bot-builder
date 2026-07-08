import Header from "../components/Header";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { findUserById } from "@/lib/users";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");
  const profile = await findUserById(user.id);
  const balance = profile?.credit_balance ?? 0;
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Dashboard</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {user.full_name}</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            จัดการ bot, เครดิต, FAQ และการใช้งานทั้งหมดในที่เดียว
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Email</div>
              <div className="mt-2 text-sm font-medium">{user.email}</div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Role</div>
              <div className="mt-2 text-sm font-medium">{user.role}</div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Credit balance</div>
              <div className="mt-2 text-sm font-medium">{balance}</div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/bots" className="rounded-full bg-[#06C755] px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5">
              Manage Bots
            </Link>
            <Link href="/dashboard/topup" className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50">
              Top up credit
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
