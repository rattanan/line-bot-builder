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
};

const packages = [
  { amount: 50, creditAmount: 500 },
  { amount: 100, creditAmount: 1200 },
  { amount: 300, creditAmount: 4000 },
];

export default function TopupPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestOrder = orders[0] ?? null;
  const activeOrders = useMemo(() => orders.filter((order) => order.status === "pending" || order.status === "uploaded" || order.status === "manual_review"), [orders]);

  async function refresh() {
    const res = await fetch("/api/dashboard/topup");
    const data = await res.json().catch(() => ({ orders: [] }));
    setOrders(data.orders || []);
  }

  useEffect(() => {
    refresh();
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
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "สร้างรายการเติมเครดิตไม่สำเร็จ");
      if (data.order?.id) {
        window.location.href = `/dashboard/topup/${data.order.id}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "สร้างรายการเติมเครดิตไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-[#06C755] to-emerald-700 p-8 text-white shadow-lg">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">Credit top-up</p>
        <h1 className="mt-3 text-3xl font-semibold">เติมเครดิตสำหรับบอทของคุณ</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50">
          เลือกแพ็กเกจ สแกน PromptPay และอัปโหลดสลิปได้ทันที ระบบจะตรวจให้อัตโนมัติถ้าข้อมูลครบ
        </p>
        {latestOrder && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm">
            ล่าสุด: Order #{latestOrder.id} - {latestOrder.status} - {latestOrder.amount} บาท / {latestOrder.credit_amount} messages
          </div>
        )}
      </div>
      {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">แพ็กเกจที่มีให้เลือก</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {packages.map((pkg) => (
          <button
            key={pkg.amount}
            onClick={() => createOrder(pkg.amount)}
            disabled={loading}
            className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#06C755] hover:bg-white disabled:opacity-50"
          >
            <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-emerald-700">{pkg.amount} บาท</div>
            <div className="mt-4 text-3xl font-bold tracking-tight text-zinc-950">{pkg.creditAmount.toLocaleString()}</div>
            <div className="mt-1 text-sm font-semibold text-emerald-700">messages</div>
            <div className="mt-3 text-xs text-zinc-600">หมดอายุใน 15 นาทีหลังสร้าง order</div>
          </button>
        ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">รายการเติมเครดิตล่าสุด</h2>
          <span className="text-sm text-zinc-500">{activeOrders.length} รายการรอจัดการ</span>
        </div>
        <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/dashboard/topup/${order.id}`} className="block rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <span>Order #{order.id}</span>
              <span>{order.status}</span>
            </div>
            <div className="mt-1 text-sm text-zinc-600">{order.amount} บาท / {order.credit_amount} messages</div>
            <div className="mt-1 text-xs text-zinc-500">หมดอายุ: {new Date(order.expires_at).toLocaleString("th-TH")}</div>
          </Link>
        ))}
        </div>
      </section>
    </main>
  );
}
