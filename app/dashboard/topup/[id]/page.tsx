"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "รอชำระเงิน";
    case "uploaded":
      return "อัปโหลดสลิปแล้ว";
    case "manual_review":
      return "กำลังตรวจสอบ";
    case "verified":
      return "เติมเครดิตสำเร็จ";
    case "rejected":
      return "ถูกปฏิเสธ";
    case "expired":
      return "หมดอายุ";
    default:
      return status;
  }
}

export default function TopupOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const res = await fetch(`/api/dashboard/topup/${orderId}`);
    const data = await res.json();
    setOrder(data.order || null);
  }

  useEffect(() => {
    refresh();
  }, [orderId]);

  const qrUrl = useMemo(() => {
    if (!order?.qr_payload) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(order.qr_payload)}`;
  }, [order?.qr_payload]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(236,253,245,0.9),white_38%,#f8fafc_100%)] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-[#06C755] to-emerald-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">PromptPay top-up</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Order #{orderId}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
                สแกน QR ตามยอดที่กำหนด แล้วอัปโหลดสลิปเพื่อให้ระบบตรวจสอบและเติมเครดิตเข้าบัญชีของคุณ
              </p>
            </div>
            <Link href="/dashboard/topup" className="w-fit rounded-full border border-white/30 bg-white/15 px-5 py-3 text-sm text-white backdrop-blur transition hover:bg-white/25">
              กลับหน้าเติมเครดิต
            </Link>
          </div>
        </div>

        {order ? (
          <div className="grid gap-6">
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Amount</div>
                <div className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">{order.amount}</div>
                <div className="mt-1 text-sm font-semibold text-emerald-700">บาท</div>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Credits</div>
                <div className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">{order.credit_amount.toLocaleString()}</div>
                <div className="mt-1 text-sm font-semibold text-emerald-700">messages</div>
              </div>
              <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Status</div>
                <div className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">{statusLabel(order.status)}</div>
                <div className="mt-2 text-sm text-zinc-600">หมดอายุ {new Date(order.expires_at).toLocaleString("th-TH")}</div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
              <div className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-950">PromptPay QR</h2>
                    <p className="mt-1 text-sm text-zinc-600">สแกนเพื่อโอนยอด {order.amount} บาท</p>
                  </div>
                  <a
                    href={qrUrl}
                    download={`topup-order-${order.id}.png`}
                    className="rounded-full bg-[#06C755] px-4 py-2 text-sm font-medium text-white"
                  >
                    ดาวน์โหลด
                  </a>
                </div>
                <div className="mt-6 flex justify-center">
                  <img alt="PromptPay QR" src={qrUrl} className="h-auto w-full max-w-[360px] rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm" />
                </div>
                <p className="mt-5 break-all rounded-2xl bg-emerald-950 p-4 text-xs leading-5 text-emerald-50">{order.qr_payload}</p>
              </div>

              <div className="grid gap-6">
                <div className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-zinc-950">วิธีชำระเงิน</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      `โอนเงินตามจำนวน ${order.amount} บาท`,
                      "ตรวจสอบชื่อผู้รับและยอดโอนให้ถูกต้อง",
                      "บันทึกสลิปหลังโอนเสร็จ",
                      "อัปโหลดสลิป jpg / png / webp",
                      "ระบบตรวจแล้วเติมเครดิตให้อัตโนมัติ",
                      "ถ้าอ่านไม่ครบจะส่งให้แอดมินตรวจสอบ",
                    ].map((text, index) => (
                      <div key={text} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                        <div className="flex gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#06C755] text-sm font-semibold text-white">{index + 1}</span>
                          <p className="text-sm leading-6 text-zinc-700">{text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form
                  className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-sm"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const fd = new FormData(form);
                    setSubmitting(true);
                    try {
                      const res = await fetch(`/api/dashboard/topup/${orderId}/upload-slip`, {
                        method: "POST",
                        body: fd,
                      });
                      const data = await res.json();
                      setMessage(data.message || "Uploaded");
                      await refresh();
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  <label className="block text-sm font-semibold text-zinc-900">Upload slip</label>
                  <input
                    type="file"
                    name="slip"
                    accept="image/png,image/jpeg,image/webp"
                    required
                    className="mt-3 block w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm"
                  />
                  <button
                    disabled={submitting}
                    className="mt-4 rounded-full bg-[#06C755] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {submitting ? "กำลังอัปโหลด..." : "อัปโหลดสลิป"}
                  </button>
                </form>
              </div>
            </section>

            {message && <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}
            {order.rejected_reason && <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">{order.rejected_reason}</p>}
            {order.ocr_result && (
              <details className="rounded-2xl border bg-zinc-50 p-4">
                <summary className="cursor-pointer text-sm font-medium">OCR result</summary>
                <pre className="mt-3 overflow-auto text-xs">{order.ocr_result}</pre>
              </details>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-200 bg-white p-6 text-zinc-600 shadow-sm">กำลังโหลดข้อมูล order...</div>
        )}
      </div>
    </main>
  );
}
