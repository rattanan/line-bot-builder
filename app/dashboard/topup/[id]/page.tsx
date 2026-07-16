"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  ocr_result: string | null;
};

const statusLabels: Record<string, Record<AppLanguage, string>> = {
  pending: { en: "Waiting for payment", th: "รอชำระเงิน" },
  uploaded: { en: "Slip uploaded", th: "อัปโหลดสลิปแล้ว" },
  manual_review: { en: "Under review", th: "กำลังตรวจสอบ" },
  verified: { en: "Credits added", th: "เติมเครดิตสำเร็จ" },
  rejected: { en: "Payment rejected", th: "รายการถูกปฏิเสธ" },
  expired: { en: "Order expired", th: "รายการหมดอายุ" },
};

function statusStyle(status: string) {
  if (status === "verified") {
    return {
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
      icon: "bg-emerald-600 text-white",
      iconName: "check" as const,
    };
  }
  if (status === "rejected" || status === "expired") {
    return {
      badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300",
      icon: "bg-red-600 text-white",
      iconName: "clock" as const,
    };
  }
  if (status === "uploaded" || status === "manual_review") {
    return {
      badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
      icon: "bg-amber-500 text-white",
      iconName: "activity" as const,
    };
  }
  return {
    badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300",
    icon: "bg-blue-600 text-white",
    iconName: "clock" as const,
  };
}

export default function TopupOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const { language, text } = useLanguage();
  const locale = language === "th" ? "th-TH" : "en-US";
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`/api/dashboard/topup/${orderId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || (language === "th" ? "ไม่สามารถโหลดรายการนี้ได้" : "Unable to load this order"));
      }
      setOrder(data.order || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : (language === "th" ? "ไม่สามารถโหลดรายการนี้ได้" : "Unable to load this order"));
    } finally {
      setLoading(false);
    }
  }, [language, orderId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const qrUrl = useMemo(() => {
    if (!order?.qr_payload) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(order.qr_payload)}`;
  }, [order?.qr_payload]);

  const canUpload = order?.status === "pending";
  const status = statusStyle(order?.status || "pending");

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <section className="app-page-header relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <AppIcon name="wallet" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
                  PromptPay · Order #{orderId}
                </p>
              </div>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                {text("Complete your payment", "ชำระเงินเพื่อเติมเครดิต")}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {text(
                  "Scan the PromptPay QR for the exact amount, then upload your payment slip for verification.",
                  "สแกน PromptPay QR ตามยอดที่กำหนด แล้วอัปโหลดสลิปเพื่อให้ระบบตรวจสอบและเติมเครดิต"
                )}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {order && (
                <span className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${status.badge}`}>
                  <AppIcon name={status.iconName} className="h-4 w-4" />
                  {statusLabels[order.status]?.[language] || order.status}
                </span>
              )}
              <Link href="/dashboard/topup" className="app-button-outline">
                <AppIcon name="chevron" className="h-4 w-4 rotate-180" />
                {text("Back to packages", "กลับไปเลือกแพ็กเกจ")}
              </Link>
            </div>
          </div>
        </section>

        {error && (
          <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="app-skeleton min-h-[34rem] rounded-[1.5rem]" />
            <div className="grid gap-6">
              <div className="app-skeleton min-h-40 rounded-[1.5rem]" />
              <div className="app-skeleton min-h-72 rounded-[1.5rem]" />
            </div>
          </div>
        ) : order ? (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="app-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {text("Payment amount", "ยอดที่ต้องชำระ")}
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-semibold tracking-tight tabular-nums text-slate-950 dark:text-white">
                    {Number(order.amount).toLocaleString(locale)}
                  </span>
                  <span className="pb-1 text-sm font-medium text-slate-500 dark:text-slate-400">{text("THB", "บาท")}</span>
                </div>
              </div>
              <div className="app-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {text("Credits received", "เครดิตที่จะได้รับ")}
                </p>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-semibold tracking-tight tabular-nums text-blue-700 dark:text-blue-300">
                    {order.credit_amount.toLocaleString(locale)}
                  </span>
                  <span className="pb-1 text-sm font-medium text-slate-500 dark:text-slate-400">{text("messages", "ข้อความ")}</span>
                </div>
              </div>
              <div className="app-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {text("Order expires", "รายการหมดอายุ")}
                </p>
                <p className="mt-3 text-lg font-semibold tabular-nums text-slate-950 dark:text-white">
                  {new Date(order.expires_at).toLocaleString(locale)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {text("Use this QR before the expiry time.", "กรุณาใช้ QR นี้ก่อนเวลาที่กำหนด")}
                </p>
              </div>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="app-card overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-5 dark:border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">PromptPay QR</p>
                      <h2 className="mt-2 text-xl font-semibold">{text("Scan to pay", "สแกนเพื่อชำระเงิน")}</h2>
                    </div>
                    <a href={qrUrl} download={`topup-order-${order.id}.png`} className="app-button-outline min-h-10 px-3 py-2 text-xs">
                      <AppIcon name="download" className="h-4 w-4" />
                      {text("Download", "ดาวน์โหลด")}
                    </a>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mx-auto max-w-[360px] rounded-[2rem] border border-blue-100 bg-white p-4 shadow-[0_18px_50px_rgba(37,99,235,0.10)] dark:border-blue-400/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={text(`PromptPay QR for order ${order.id}`, `PromptPay QR สำหรับรายการ ${order.id}`)} src={qrUrl} width="360" height="360" className="h-auto w-full rounded-2xl" />
                  </div>
                  <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-center dark:border-blue-400/20 dark:bg-blue-400/[0.08]">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{text("Transfer the exact amount", "โอนตามยอดที่กำหนดเท่านั้น")}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-blue-700 dark:text-blue-300">
                      {Number(order.amount).toLocaleString(locale)} {text("THB", "บาท")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid content-start gap-6">
                <div className="app-card p-6">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${status.icon}`}>
                      <AppIcon name={status.iconName} className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {text("Payment status", "สถานะการชำระเงิน")}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold">{statusLabels[order.status]?.[language] || order.status}</h2>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      [text("Scan QR", "สแกน QR"), true],
                      [text("Upload slip", "อัปโหลดสลิป"), order.status !== "pending"],
                      [text("Receive credits", "รับเครดิต"), order.status === "verified"],
                    ].map(([label, complete], index) => (
                      <div key={String(label)} className={`rounded-2xl border p-4 ${complete ? "border-blue-200 bg-blue-50/70 dark:border-blue-400/20 dark:bg-blue-400/[0.08]" : "border-slate-200 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.03]"}`}>
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${complete ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
                          {complete ? <AppIcon name="check" className="h-4 w-4" /> : index + 1}
                        </span>
                        <p className="mt-3 text-sm font-medium">{String(label)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {canUpload ? (
                  <form
                    className="app-card p-6"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const form = event.currentTarget;
                      const fd = new FormData(form);
                      setSubmitting(true);
                      setMessage("");
                      setError("");
                      try {
                        const res = await fetch(`/api/dashboard/topup/${orderId}/upload-slip`, {
                          method: "POST",
                          body: fd,
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) throw new Error(data.error || text("Unable to upload slip", "อัปโหลดสลิปไม่สำเร็จ"));
                        setMessage(data.message || text("Slip uploaded", "อัปโหลดสลิปแล้ว"));
                        await refresh();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : text("Unable to upload slip", "อัปโหลดสลิปไม่สำเร็จ"));
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                        <AppIcon name="upload" className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-lg font-semibold">{text("Upload payment slip", "อัปโหลดสลิปการชำระเงิน")}</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">JPG, PNG, WEBP · {text("Maximum 5 MB", "ขนาดสูงสุด 5 MB")}</p>
                      </div>
                    </div>
                    <label className="mt-5 block">
                      <span className="sr-only">{text("Choose payment slip", "เลือกไฟล์สลิป")}</span>
                      <input
                        type="file"
                        name="slip"
                        accept="image/png,image/jpeg,image/webp"
                        required
                        className="block min-h-14 w-full cursor-pointer rounded-2xl border border-dashed border-blue-300 bg-blue-50/60 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white dark:border-blue-400/30 dark:bg-blue-400/[0.08] dark:text-slate-300"
                      />
                    </label>
                    <button disabled={submitting} className="app-button-primary mt-4 w-full disabled:opacity-50">
                      <AppIcon name="upload" className="h-4 w-4" />
                      {submitting ? text("Uploading and checking...", "กำลังอัปโหลดและตรวจสอบ...") : text("Upload and verify slip", "อัปโหลดและตรวจสอบสลิป")}
                    </button>
                  </form>
                ) : (
                  <div className="app-card p-6">
                    <h2 className="text-lg font-semibold">{text("What happens next", "ขั้นตอนถัดไป")}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {order.status === "verified"
                        ? text("Your credits have been added and are ready to use.", "เครดิตถูกเพิ่มเข้าบัญชีแล้วและพร้อมใช้งาน")
                        : order.status === "rejected"
                          ? text("This payment could not be approved. Review the reason below and create a new order if needed.", "รายการนี้ไม่ผ่านการตรวจสอบ โปรดดูเหตุผลด้านล่างและสร้างรายการใหม่หากต้องการ")
                          : order.status === "expired"
                            ? text("This QR has expired. Return to the packages page to create a new order.", "QR นี้หมดอายุแล้ว กรุณากลับไปเลือกแพ็กเกจเพื่อสร้างรายการใหม่")
                            : text("We received your slip. Verification may take a moment; the status will update when complete.", "ระบบได้รับสลิปแล้ว การตรวจสอบอาจใช้เวลาสักครู่ และสถานะจะอัปเดตเมื่อเสร็จสิ้น")}
                    </p>
                    {(order.status === "expired" || order.status === "rejected") && (
                      <Link href="/dashboard/topup" className="app-button-primary mt-4">
                        {text("Create a new order", "สร้างรายการใหม่")}
                        <AppIcon name="arrow" className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </section>

            {message && (
              <div role="status" className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                {message}
              </div>
            )}
            {order.rejected_reason && (
              <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                <span className="font-semibold">{text("Reason:", "เหตุผล:")}</span> {order.rejected_reason}
              </div>
            )}
            {order.ocr_result && (
              <details className="app-card mt-5 p-5">
                <summary className="cursor-pointer text-sm font-medium">{text("Technical verification details", "รายละเอียดการตรวจสอบทางเทคนิค")}</summary>
                <pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">{order.ocr_result}</pre>
              </details>
            )}
          </>
        ) : (
          !error && <div className="app-empty-state mt-6"><p className="text-sm text-slate-500">{text("Order not found.", "ไม่พบรายการนี้")}</p></div>
        )}
      </main>
    </>
  );
}
