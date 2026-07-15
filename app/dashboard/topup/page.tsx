"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import AppIcon from "@/app/components/AppIcon";
import { type AppLanguage, useLanguage } from "@/app/components/LanguageProvider";

type Order = {
  id: number;
  amount: string;
  credit_amount: number;
  status: string;
  qr_payload: string;
  slip_image_url: string | null;
  rejected_reason: string | null;
  created_at: string;
  expires_at: string;
};

const packages = [
  { amount: 50, creditAmount: 500 },
  { amount: 100, creditAmount: 1200 },
  { amount: 300, creditAmount: 4000 },
];

function statusStyle(status: string) {
  if (status === "verified") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300";
  if (status === "rejected" || status === "expired") return "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300";
  if (status === "uploaded" || status === "manual_review") return "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300";
  return "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300";
}

const statusLabels: Record<string, Record<AppLanguage, string>> = {
  pending: { en: "Pending", th: "รอชำระ" },
  uploaded: { en: "Uploaded", th: "อัปโหลดแล้ว" },
  verified: { en: "Verified", th: "สำเร็จ" },
  rejected: { en: "Rejected", th: "ปฏิเสธ" },
  manual_review: { en: "Manual review", th: "รอตรวจสอบ" },
  expired: { en: "Expired", th: "หมดอายุ" },
};

export default function TopupPage() {
  const router = useRouter();
  const { language, text } = useLanguage();
  const locale = language === "th" ? "th-TH" : "en-US";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestOrder = orders[0] ?? null;
  const activeOrders = useMemo(() => orders.filter((order) => order.status === "pending" || order.status === "uploaded" || order.status === "manual_review"), [orders]);

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard/topup")
      .then((res) => res.json())
      .then((data) => {
        if (active) setOrders(data.orders || []);
      })
      .catch(() => {
        if (active) setOrders([]);
      });
    return () => {
      active = false;
    };
  }, []);

  async function createOrder(amount: number) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/topup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const responseText = await res.text();
      const data = responseText ? JSON.parse(responseText) : {};
      if (!res.ok) throw new Error(data.error || text("Unable to create credit order", "สร้างรายการเติมเครดิตไม่สำเร็จ"));
      if (data.order?.id) {
        router.push(`/dashboard/topup/${data.order.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : text("Unable to create credit order", "สร้างรายการเติมเครดิตไม่สำเร็จ"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="app-page-header relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><AppIcon name="wallet" /></span>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">Credits &amp; Billing</p>
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{text("Add credits to your agents", "เติมเครดิตสำหรับเอเจนต์ของคุณ")}</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">{text("Choose a package, scan PromptPay, and upload your payment slip. Complete orders are verified automatically.", "เลือกแพ็กเกจ สแกน PromptPay และอัปโหลดสลิป ระบบจะตรวจสอบรายการให้อัตโนมัติเมื่อข้อมูลครบถ้วน")}</p>
            </div>
            {latestOrder && (
              <Link href={`/dashboard/topup/${latestOrder.id}`} className="min-w-64 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 transition hover:border-blue-300 hover:bg-blue-50 dark:border-blue-400/20 dark:bg-blue-400/10 dark:hover:border-blue-400/40">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">{text("Latest order", "รายการล่าสุด")}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${statusStyle(latestOrder.status)}`}>{statusLabels[latestOrder.status]?.[language] || latestOrder.status.replace("_", " ")}</span>
                </div>
                <p className="mt-3 font-semibold text-slate-950 dark:text-white">Order #{latestOrder.id}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{Number(latestOrder.amount).toLocaleString(locale)} {text("THB", "บาท")} · {latestOrder.credit_amount.toLocaleString(locale)} {text("messages", "ข้อความ")}</p>
              </Link>
            )}
          </div>
        </section>
        {error && <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">{error}</div>}

        <section className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300">{text("Choose a package", "เลือกแพ็กเกจ")}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{text("Credit packages", "แพ็กเกจเครดิต")}</h2></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{text("1 message = 1 customer response", "1 ข้อความ = 1 คำตอบสำหรับลูกค้า")}</p>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {packages.map((pkg, index) => (
              <button
                type="button"
                key={pkg.amount}
                onClick={() => createOrder(pkg.amount)}
                disabled={loading}
                className={`app-card app-card-interactive relative p-6 text-left disabled:opacity-50 ${index === 1 ? "border-blue-300 ring-1 ring-blue-200 dark:border-blue-400/40 dark:ring-blue-400/20" : ""}`}
              >
                {index === 1 && <span className="absolute right-5 top-5 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">{text("Popular", "ยอดนิยม")}</span>}
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">{pkg.amount.toLocaleString(locale)} {text("THB", "บาท")}</span>
                <div className="mt-6 flex items-end gap-2"><span className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">{pkg.creditAmount.toLocaleString(locale)}</span><span className="pb-1 text-sm font-medium text-slate-500 dark:text-slate-400">{text("messages", "ข้อความ")}</span></div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400"><span>{text("PromptPay payment", "ชำระผ่าน PromptPay")}</span><AppIcon name="arrow" className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{text("Payment orders expire 15 minutes after creation.", "รายการชำระเงินจะหมดอายุภายใน 15 นาทีหลังสร้างรายการ")}</p>
        </section>

        <section className="app-card mt-8 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-semibold">{text("Recent credit orders", "รายการเติมเครดิตล่าสุด")}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{language === "th" ? `${activeOrders.length} รายการกำลังดำเนินการ` : `${activeOrders.length} active order${activeOrders.length === 1 ? "" : "s"}`}</p></div>
            <Link href="/dashboard/topup/history" className="app-button-outline min-h-10 w-fit px-4 py-2 text-sm"><AppIcon name="history" className="h-4 w-4" />{text("View all history", "ดูประวัติทั้งหมด")}</Link>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-white/10">
            {orders.map((order) => (
              <Link key={order.id} href={`/dashboard/topup/${order.id}`} className="group flex flex-col gap-3 px-6 py-5 transition hover:bg-blue-50/60 dark:hover:bg-blue-400/[0.06] sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-semibold text-slate-950 dark:text-white">Order #{order.id}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{Number(order.amount).toLocaleString(locale)} {text("THB", "บาท")} · {order.credit_amount.toLocaleString(locale)} {text("messages", "ข้อความ")}</p></div>
                <div className="flex items-center gap-3 sm:justify-end"><div className="text-left sm:text-right"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${statusStyle(order.status)}`}>{statusLabels[order.status]?.[language] || order.status.replace("_", " ")}</span><p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{text("Expires", "หมดอายุ")} {new Date(order.expires_at).toLocaleString(locale)}</p></div><AppIcon name="chevron" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" /></div>
              </Link>
            ))}
            {!orders.length && <div className="app-empty-state m-5 min-h-48"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><AppIcon name="wallet" /></span><h3 className="mt-4 font-semibold text-slate-950 dark:text-white">{text("No credit orders yet", "ยังไม่มีรายการเติมเครดิต")}</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{text("Choose a package above to create your first order.", "เลือกแพ็กเกจด้านบนเพื่อสร้างรายการแรก")}</p></div>}
            </div>
        </section>
      </main>
    </>
  );
}
