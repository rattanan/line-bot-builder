import Header from "../components/Header";
import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Admin portal</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">System overview</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            ตรวจสอบผู้ใช้ บอท เครดิต และ transaction history ได้จากศูนย์กลางเดียว
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/users" className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white">
              Users
            </Link>
            <Link href="/admin/bots" className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900">
              Bots
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
