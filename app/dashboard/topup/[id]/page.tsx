"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function TopupOrderPage({ params }: { params: { id: string } }) {
  const orderId = params.id;
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
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Top up order #{orderId}</h1>
          <p className="mt-2 text-sm text-zinc-600">
            ใช้ QR ด้านล่างเพื่อโอนเงิน จากนั้นอัปโหลดสลิปเพื่อให้ระบบตรวจสอบ
          </p>
        </div>
        <Link href="/dashboard/topup" className="rounded-full border px-4 py-2 text-sm">
          กลับหน้าเติมเครดิต
        </Link>
      </div>

      {order ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-4 rounded-[2rem] border bg-white p-6 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-zinc-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Amount</div>
                <div className="mt-2 text-xl font-semibold">{order.amount} บาท</div>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Credits</div>
                <div className="mt-2 text-xl font-semibold">{order.credit_amount.toLocaleString()}</div>
              </div>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Status</div>
                <div className="mt-2 text-xl font-semibold">{statusLabel(order.status)}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">PromptPay QR</h2>
                  <p className="mt-1 text-sm text-zinc-600">สแกนหรือดาวน์โหลด QR นี้เพื่อโอนตามจำนวนที่กำหนด</p>
                </div>
                <a
                  href={qrUrl}
                  download={`topup-order-${order.id}.png`}
                  className="rounded-full bg-[#06C755] px-4 py-2 text-sm text-white"
                >
                  ดาวน์โหลด QR
                </a>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[360px_1fr]">
                <img alt="PromptPay QR" src={qrUrl} className="rounded-3xl border bg-white p-3" />
                <div className="space-y-3 text-sm text-zinc-700">
                  <p>1. โอนเงินตามจำนวน {order.amount} บาท</p>
                  <p>2. ตรวจสอบว่าเวลาในสลิปไม่เก่ากว่าเวลาสร้าง order มากเกินไป</p>
                  <p>3. อัปโหลดไฟล์สลิปชนิด jpg / png / webp เท่านั้น</p>
                  <p>4. ระบบจะเติมเครดิตให้อัตโนมัติถ้าข้อมูลครบและตรง</p>
                  <p>5. ถ้าอ่านไม่ครบ ระบบจะส่งเข้าตรวจสอบโดยแอดมิน</p>
                </div>
              </div>
              <p className="mt-4 break-all rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100">{order.qr_payload}</p>
            </div>

            <form
              className="space-y-4 rounded-3xl border bg-white p-5"
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
              <div>
                <label className="block text-sm font-medium">Upload slip</label>
                <input
                  type="file"
                  name="slip"
                  accept="image/png,image/jpeg,image/webp"
                  required
                  className="mt-2 block w-full text-sm"
                />
              </div>
              <button
                disabled={submitting}
                className="rounded-full bg-[#06C755] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? "กำลังอัปโหลด..." : "อัปโหลดสลิป"}
              </button>
            </form>

            {message && <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}
            {order.rejected_reason && <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">{order.rejected_reason}</p>}
            {order.ocr_result && (
              <details className="rounded-2xl border bg-zinc-50 p-4">
                <summary className="cursor-pointer text-sm font-medium">OCR result</summary>
                <pre className="mt-3 overflow-auto text-xs">{order.ocr_result}</pre>
              </details>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border bg-zinc-950 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Status</p>
              <h2 className="mt-2 text-2xl font-semibold">{statusLabel(order.status)}</h2>
              <p className="mt-3 text-sm text-zinc-300">
                Order จะหมดอายุเวลา {new Date(order.expires_at).toLocaleString("th-TH")}
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-5 text-sm">
              <h3 className="font-semibold">หลังอัปโหลดแล้ว</h3>
              <ul className="mt-3 space-y-2 text-zinc-600">
                <li>• ถ้าผ่านตรวจ จะเห็นข้อความเติมเครดิตสำเร็จทันที</li>
                <li>• ถ้าอ่านไม่ครบ ระบบจะขึ้นกำลังตรวจสอบ</li>
                <li>• ถ้าถูก reject จะแสดงเหตุผลบนหน้านี้</li>
              </ul>
            </div>
          </aside>
        </div>
      ) : (
        <div className="rounded-3xl border p-6">กำลังโหลดข้อมูล order...</div>
      )}
    </main>
  );
}
