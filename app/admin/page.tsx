import Header from "../components/Header";
import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-black/5 bg-white/80 p-8 shadow-[0_10px_40px_rgba(24,24,27,0.06)] backdrop-blur-sm">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Admin console</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">User management</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
            จัดการบัญชีผู้ใช้ที่มีสิทธิ์เข้าสู่ระบบ เพิ่ม ลบ และแก้ไขข้อมูลได้จากหน้าเดียว
          </p>
          <div className="mt-6">
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              Open User Management
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
