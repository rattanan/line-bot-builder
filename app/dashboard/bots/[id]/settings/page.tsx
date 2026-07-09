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
  status: "active" | "suspended";
};

export default function BotSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const [botId, setBotId] = useState<number | null>(null);
  const [bot, setBot] = useState<Bot | null>(null);
  const [lineChannelSecret, setLineChannelSecret] = useState("");
  const [lineChannelAccessToken, setLineChannelAccessToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [canTest, setCanTest] = useState(false);
  const [copyResult, setCopyResult] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setBotId(Number(p.id)));
  }, [params]);

  useEffect(() => {
    if (!botId) return;
    const load = async () => {
      const res = await fetch(`/api/dashboard/bots/${botId}/usage`);
      const data = await res.json();
      setBot(data.bot);
      setLineChannelSecret(data.bot?.line_channel_secret || "");
      setLineChannelAccessToken(data.bot?.line_channel_access_token || "");
      setCanTest(Boolean(data.bot?.line_channel_secret && data.bot?.line_channel_access_token));
    };
    load();
  }, [botId]);

  const webhookUrl = botId && canTest ? `${typeof window !== "undefined" ? window.location.origin : ""}/api/line/webhook/${botId}` : "";
  const appOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const embedCode =
    botId && bot
      ? `<script src="${appOrigin}/embed/chat-widget.js" data-tenant-id="${botId}" data-bot-name="${escapeAttr(bot.bot_name)}" data-theme-color="#06C755" data-greeting-message="สวัสดีครับ มีอะไรให้ช่วยไหมครับ" data-logo-url=""></script>`
      : "";

  const copyEmbedCode = async () => {
    if (!embedCode) return;
    await navigator.clipboard.writeText(embedCode);
    setCopyResult("คัดลอก embed code แล้ว");
  };

  const saveConnection = async () => {
    if (!botId) return;
    setIsSaving(true);
    setSaveResult(null);
    setTestResult(null);
    try {
      const res = await fetch(`/api/dashboard/bots/${botId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineChannelSecret,
          lineChannelAccessToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setBot(data.bot);
      setCanTest(Boolean(data.bot?.line_channel_secret && data.bot?.line_channel_access_token));
      setSaveResult("บันทึกข้อมูลสำเร็จแล้ว");
    } catch (error) {
      setSaveResult(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!botId) return;
    if (!canTest) {
      setTestResult("กรุณากด Save ให้เรียบร้อยก่อน");
      return;
    }
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
              <Link href={`/dashboard/bots/${botId || ""}/knowledge`} className="inline-flex rounded-full border px-4 py-2 text-sm">
                Review Knowledge
              </Link>
              <Step title="1) สร้าง LINE Messaging API Channel">
                เข้า LINE Developers Console แล้วสร้าง Provider ใหม่ จากนั้นสร้าง Channel ประเภท Messaging API
                <ExternalDocLink href="https://developers.line.biz/console/" label="เปิด LINE Developers Console" />
                <ExternalDocLink href="https://developers.line.biz/en/docs/messaging-api/getting-started/" label="ดูคู่มือเริ่มต้น Messaging API" />
              </Step>
              <Step title="2) หา Channel Secret">
                หลังสร้าง channel แล้ว ให้เปิดหน้า Basic settings จะเห็น Channel Secret ให้นำค่านี้มาใส่ในช่อง Channel Secret ของบอท
                <ExternalDocLink href="https://developers.line.biz/console/" label="ไปที่หน้า Channel ใน LINE Developers Console" />
                <ExternalDocLink href="https://developers.line.biz/en/docs/basics/channel-secret/" label="อ่านรายละเอียด Channel Secret" />
              </Step>
              <Step title="3) สร้าง Channel Access Token">
                เข้า Messaging API settings แล้วกดออก token แบบ long-lived access token จากนั้นคัดลอกมาใส่ในช่อง Channel Access Token
                <ExternalDocLink href="https://developers.line.biz/en/docs/messaging-api/channel-access-tokens/" label="อ่านวิธีสร้าง Channel Access Token" />
              </Step>
              <Step title="4) ตั้งค่า Webhook URL">
                ใช้ URL นี้เป็น Webhook ของบอทตัวนี้
                <div className="mt-2 rounded-2xl border bg-zinc-50 px-4 py-3 font-mono text-xs break-all">{webhookUrl || "โหลดหน้าเพื่อแสดง webhook URL"}</div>
                <ExternalDocLink href="https://developers.line.biz/en/docs/messaging-api/receiving-messages/" label="อ่านคู่มือการรับข้อความผ่าน Webhook" />
              </Step>
              <Step title="5) เปิด Use webhook">
                กลับไปที่ Messaging API settings แล้วเปิดสวิตช์ Use webhook ให้เป็นเปิด เพื่อให้ข้อความจาก LINE ส่งมาที่ระบบนี้
                <ExternalDocLink href="https://developers.line.biz/console/" label="เปิดหน้า Messaging API settings" />
                <ExternalDocLink href="https://developers.line.biz/en/docs/messaging-api/receiving-messages/" label="ดูวิธีเปิดและใช้งาน Webhook" />
              </Step>
              <Step title="6) ทดสอบการเชื่อมต่อ">
                เมื่อกรอก Channel Secret และ Access Token แล้ว ให้กดปุ่ม Test Connection ด้านล่าง เพื่อตรวจว่าระบบเชื่อมกับ LINE ได้จริง
                <ExternalDocLink href="https://developers.line.biz/en/reference/messaging-api/" label="ดู Messaging API Reference" />
              </Step>
            </div>
          </div>

          <div className="rounded-[2rem] border bg-white/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">วิธีตั้งค่า</h2>
            <div className="mt-4 space-y-3 text-sm text-zinc-700">
              <p>Bot name: {bot?.bot_name || "-"}</p>
              <p>Business: {bot?.business_name || "-"}</p>
              <p>Status: {bot?.status || "-"}</p>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-zinc-700">LINE Channel Secret</span>
                <input
                  value={lineChannelSecret}
                  onChange={(e) => {
                    setLineChannelSecret(e.target.value);
                    setCanTest(false);
                  }}
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none"
                  placeholder="ใส่ Channel Secret"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-zinc-700">LINE Channel Access Token</span>
                <textarea
                  value={lineChannelAccessToken}
                  onChange={(e) => {
                    setLineChannelAccessToken(e.target.value);
                    setCanTest(false);
                  }}
                  className="min-h-[110px] rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none"
                  placeholder="ใส่ Channel Access Token"
                />
              </label>
              <button
                onClick={saveConnection}
                disabled={isSaving}
                className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white disabled:opacity-40"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              {saveResult && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saveResult}</div>}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs break-all">
                {webhookUrl || "กด Save ก่อนเพื่อแสดง Webhook URL"}
              </div>
              <button
                onClick={testConnection}
                disabled={isTesting || !canTest}
                className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white disabled:opacity-40"
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </button>
              {testResult && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{testResult}</div>}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border bg-white/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Website Chat Widget</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                นำโค้ดนี้ไปวางก่อนปิดแท็ก body ของเว็บไซต์ลูกค้า เพื่อแสดงปุ่มแชทมุมขวาล่าง
              </p>
            </div>
            <button
              type="button"
              onClick={copyEmbedCode}
              disabled={!embedCode}
              className="rounded-full bg-[#06C755] px-5 py-3 text-sm text-white disabled:opacity-40"
            >
              Copy Embed Code
            </button>
          </div>
          <pre className="mt-4 overflow-auto rounded-2xl border bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">
            {embedCode || "กำลังโหลด embed code..."}
          </pre>
          {copyResult && <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{copyResult}</div>}
        </section>
      </main>
    </div>
  );
}

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="font-semibold text-zinc-900">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ExternalDocLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
    >
      {label}
    </a>
  );
}
