"use client";

import Header from "@/app/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";

type Bot = {
  id: number;
  bot_name: string;
  business_name: string;
  business_description: string;
  system_prompt: string;
  line_channel_secret: string | null;
  line_channel_access_token: string | null;
  credit_balance: number;
  status: "active" | "suspended";
};

export default function BotSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const [botId, setBotId] = useState<number | null>(null);
  const [bot, setBot] = useState<Bot | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    params.then((p) => setBotId(Number(p.id)));
  }, [params]);

  useEffect(() => {
    if (!botId) return;
    const load = async () => {
      const res = await fetch(`/api/dashboard/bots/${botId}/usage`);
      const data = await res.json();
      setBot(data.bot);
    };
    load();
  }, [botId]);

  const webhookUrl = botId ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/line/webhook/${botId}` : "";

  const testConnection = async () => {
    if (!botId) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/dashboard/bots/${botId}/line-connection-test`, { method: "POST" });
      const data = await res.json();
      setTestResult(data.ok ? "เชื่อมต่อสำเร็จ" : data.message || "ทดสอบไม่สำเร็จ");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.95),white_42%,#f8fafc_100%)] text-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">LINE Setup</h1>
            <p className="text-sm text-zinc-600">คู่มือการตั้งค่า LINE Developers สำหรับบอทตัวนี้</p>
          </div>
          <Link href="/dashboard/bots" className="rounded-full border px-4 py-2 text-sm">Back</Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">วิธีตั้งค่า LINE Developers</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-700">
              <Step title="1) สร้าง LINE Messaging API Channel">
                เข้า LINE Developers Console แล้วสร้าง Provider ใหม่ จากนั้นสร้าง Channel ประเภท Messaging API
              </Step>
              <Step title="2) หา Channel Secret">
                หลังสร้าง channel แล้ว ให้เปิดหน้า Basic settings จะเห็น Channel Secret ให้นำค่านี้มาใส่ในช่อง Channel Secret ของบอท
              </Step>
              <Step title="3) สร้าง Channel Access Token">
                เข้า Messaging API settings แล้วกดออก token แบบ long-lived access token จากนั้นคัดลอกมาใส่ในช่อง Channel Access Token
              </Step>
              <Step title="4) ตั้งค่า Webhook URL">
                ใช้ URL นี้เป็น Webhook ของบอทตัวนี้
                <div className="mt-2 rounded-2xl border bg-zinc-50 px-4 py-3 font-mono text-xs break-all">{webhookUrl || "โหลดหน้าเพื่อแสดง webhook URL"}</div>
              </Step>
              <Step title="5) เปิด Use webhook">
                กลับไปที่ Messaging API settings แล้วเปิดสวิตช์ Use webhook ให้เป็นเปิด เพื่อให้ข้อความจาก LINE ส่งมาที่ระบบนี้
              </Step>
              <Step title="6) ทดสอบการเชื่อมต่อ">
                เมื่อกรอก Channel Secret และ Access Token แล้ว ให้กดปุ่ม Test Connection ด้านล่าง เพื่อตรวจว่าระบบเชื่อมกับ LINE ได้จริง
              </Step>
            </div>
          </div>

          <div className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">ข้อมูลบอท</h2>
            <div className="mt-4 space-y-3 text-sm text-zinc-700">
              <p>Bot name: {bot?.bot_name || "-"}</p>
              <p>Business: {bot?.business_name || "-"}</p>
              <p>Status: {bot?.status || "-"}</p>
              <p>Credit: {bot?.credit_balance ?? 0}</p>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs break-all">
                {webhookUrl || "Webhook URL จะปรากฏเมื่อโหลดหน้าเสร็จ"}
              </div>
              <button
                onClick={testConnection}
                disabled={isTesting}
                className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white disabled:opacity-40"
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </button>
              {testResult && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{testResult}</div>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="font-semibold text-zinc-900">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
