import Header from "../components/Header";
import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="app-card p-8">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Admin portal</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">System overview</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            ตรวจสอบผู้ใช้ เอเจนต์ เครดิต และ transaction history ได้จากศูนย์กลางเดียว
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/users" className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white">
              Users
            </Link>
            <Link href="/admin/bots" className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900">
              Agents
            </Link>
            <Link href="/admin/topup-reviews" className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900">
              Top-up Reviews
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
