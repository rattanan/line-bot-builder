"use client";

import Link from "next/link";
import Header from "../components/Header";

export default function VerifyEmailInfoPage() {
  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-4xl gap-8 lg:grid-cols-2">
          <section className="app-card p-8">
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">Email verification</span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">ตรวจสอบอีเมลของคุณ</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              ระบบจะส่งลิงก์ยืนยันไปยังอีเมลที่สมัครไว้ เปิดอีเมลแล้วกดลิงก์เพื่อเปิดใช้งานบัญชี
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/login" className="app-button-primary">
                ไปหน้าเข้าสู่ระบบ
              </Link>
              <Link href="/register" className="app-button-outline">
                สมัครสมาชิกใหม่
              </Link>
            </div>
          </section>

          <section className="app-card border-blue-100 bg-blue-50/70 p-8 dark:border-blue-400/15 dark:bg-blue-400/[0.06]">
            <h2 className="text-lg font-semibold text-blue-950">ถ้ายังไม่ได้รับอีเมล</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-blue-900/80">
              <li>• ตรวจสอบโฟลเดอร์ Spam / Promotions</li>
              <li>• กดปุ่ม resend verification ในหน้า login</li>
              <li>• ตรวจสอบว่าอีเมลที่ใช้สมัครถูกต้อง</li>
            </ul>
            <div className="mt-6 rounded-2xl border border-white/60 bg-white p-4 text-sm text-blue-950">
              ถ้าคุณคลิกลิงก์ในอีเมลแล้ว ระบบจะพากลับหน้า login พร้อมข้อความยืนยัน
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
