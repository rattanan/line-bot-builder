"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Review = {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  amount: string;
  credit_amount: number;
  status: string;
  slip_image_url: string | null;
  ocr_result: string | null;
  rejected_reason: string | null;
};

export default function TopupReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/admin/topup-reviews");
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, []);

  async function act(id: number, action: "approve" | "reject") {
    const res = await fetch(`/api/admin/topup-reviews/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, reason: action === "reject" ? "Rejected by admin" : undefined }),
    });
    if (res.ok) refresh();
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-[2rem] border bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">Admin portal</p>
        <h1 className="mt-3 text-3xl font-semibold">Top-up Review</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          ตรวจสลิปที่ OCR อ่านไม่ครบหรือยังต้องตรวจเพิ่ม ระบบจะกัน order เดิมและ transaction id ซ้ำให้อัตโนมัติ
        </p>
      </div>
      <div className="mt-6 flex items-center justify-between text-sm text-zinc-600">
        <span>รายการรอตรวจ: {reviews.length}</span>
        <button onClick={refresh} className="rounded-full border px-4 py-2 text-zinc-900">
          {loading ? "กำลังรีเฟรช..." : "รีเฟรช"}
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-3xl border bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="font-medium">
                  {review.full_name} ({review.email})
                </div>
                <div className="text-sm text-zinc-600">
                  Order #{review.id} • {review.amount} บาท • {review.credit_amount} messages • {review.status}
                </div>
                {review.rejected_reason && <div className="text-sm text-rose-600">{review.rejected_reason}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => act(review.id, "approve")} className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white">
                  Approve
                </button>
                <button onClick={() => act(review.id, "reject")} className="rounded-full bg-rose-600 px-4 py-2 text-sm text-white">
                  Reject
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
              {review.slip_image_url ? (
                <img src={review.slip_image_url} alt="slip" className="rounded-2xl border" />
              ) : (
                <div className="rounded-2xl border bg-zinc-50 p-6 text-sm text-zinc-500">No slip uploaded yet</div>
              )}
              <div>
                <h3 className="text-sm font-semibold">OCR result</h3>
                {review.ocr_result ? (
                  <pre className="mt-2 overflow-auto rounded-2xl bg-zinc-950 p-4 text-xs text-zinc-100">{review.ocr_result}</pre>
                ) : (
                  <div className="mt-2 rounded-2xl border bg-zinc-50 p-4 text-sm text-zinc-500">OCR ยังไม่มีผลลัพธ์</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      </main>
    </>
  );
}
