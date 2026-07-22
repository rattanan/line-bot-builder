"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TopupOrder } from "@/lib/topup";
import AppIcon from "./AppIcon";
import { type AppLanguage, useLanguage } from "./LanguageProvider";

const statusStyles: Record<TopupOrder["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  uploaded: "bg-blue-50 text-blue-700",
  verified: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  manual_review: "bg-violet-50 text-violet-700",
  expired: "bg-zinc-100 text-zinc-600",
};

const pageSize = 8;

const statusLabels: Record<TopupOrder["status"], Record<AppLanguage, string>> = {
  pending: { en: "Pending", th: "รอชำระ" },
  uploaded: { en: "Uploaded", th: "อัปโหลดแล้ว" },
  verified: { en: "Verified", th: "สำเร็จ" },
  rejected: { en: "Rejected", th: "ปฏิเสธ" },
  manual_review: { en: "Manual review", th: "รอตรวจสอบ" },
  expired: { en: "Expired", th: "หมดอายุ" },
};

export default function TopupHistoryTable({ orders, linkToDetails = false, staticHeader = false }: { orders: TopupOrder[]; linkToDetails?: boolean; staticHeader?: boolean }) {
  const { language, text } = useLanguage();
  const locale = language === "th" ? "th-TH" : "en-US";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => orders.filter((order) => {
    const matchesQuery = `#${order.id} ${order.amount} ${order.credit_amount}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (status === "all" || order.status === status);
  }), [orders, query, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleOrders = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (!orders.length) {
    return <div className="app-empty-state mt-6 min-h-56"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><AppIcon name="history" /></span><h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{text("No billing history yet", "ยังไม่มีประวัติการเติมเครดิต")}</h3><p className="mt-2 text-sm text-slate-500">{text("New orders will appear here after you create a credit order.", "รายการใหม่จะแสดงที่นี่หลังจากสร้างคำสั่งเติมเครดิต")}</p></div>;
  }

  return (
    <div className="mt-6">
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_190px]">
        <label className="relative"><span className="sr-only">{text("Search billing history", "ค้นหาประวัติการชำระเงิน")}</span><AppIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={text("Search order or amount", "ค้นหาเลขที่รายการหรือยอดเงิน")} className="w-full py-3 pl-11 pr-4 text-sm" /></label>
        <select aria-label={text("Filter by status", "กรองตามสถานะ")} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="px-4 py-3 text-sm"><option value="all">{text("All statuses", "ทุกสถานะ")}</option>{(Object.keys(statusStyles) as TopupOrder["status"][]).map((item) => <option key={item} value={item}>{statusLabels[item][language]}</option>)}</select>
      </div>
      <div className={`${staticHeader ? "app-table-static-header " : ""}overflow-x-auto rounded-[1.5rem] border border-zinc-200 dark:border-white/10`}>
        <table className="min-w-[820px] w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-[0.15em] text-zinc-500">
            <tr><th className="px-4 py-3">{text("Order", "รายการ")}</th><th className="px-4 py-3">{text("Amount", "ยอดเงิน")}</th><th className="px-4 py-3">{text("Credits", "เครดิต")}</th><th className="px-4 py-3">{text("Status", "สถานะ")}</th><th className="px-4 py-3">{text("Created", "สร้างเมื่อ")}</th><th className="px-4 py-3">{text("Completed", "สำเร็จเมื่อ")}</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-white/10 dark:bg-transparent">
            {visibleOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-4 font-medium">{linkToDetails ? <Link href={`/dashboard/topup/${order.id}`} className="text-blue-700 hover:underline dark:text-blue-300">#{order.id}</Link> : `#${order.id}`}</td>
                <td className="px-4 py-4">{Number(order.amount).toLocaleString(locale)} {text("THB", "บาท")}</td><td className="px-4 py-4">{order.credit_amount.toLocaleString(locale)} {text("credits", "เครดิต")}</td>
                <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}>{statusLabels[order.status][language]}</span>{order.rejected_reason && <div className="mt-2 max-w-xs text-xs text-red-600">{order.rejected_reason}</div>}</td>
                <td className="px-4 py-4 text-zinc-500">{new Date(order.created_at).toLocaleString(locale)}</td><td className="px-4 py-4 text-zinc-500">{order.verified_at ? new Date(order.verified_at).toLocaleString(locale) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visibleOrders.length && <div className="p-10 text-center text-sm text-slate-500">{text("No billing records match your filters.", "ไม่พบรายการที่ตรงกับตัวกรอง")}</div>}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>{language === "th" ? `${filtered.length} รายการ` : `${filtered.length} record${filtered.length === 1 ? "" : "s"}`}</span><div className="flex items-center gap-2"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={safePage === 1} className="app-button-outline min-h-9 px-3 py-1.5 text-xs disabled:opacity-40">{text("Previous", "ก่อนหน้า")}</button><span>{text("Page", "หน้า")} {safePage} {text("of", "จาก")} {pageCount}</span><button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={safePage === pageCount} className="app-button-outline min-h-9 px-3 py-1.5 text-xs disabled:opacity-40">{text("Next", "ถัดไป")}</button></div></div>
    </div>
  );
}
