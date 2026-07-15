"use client";

import Header from "@/app/components/Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";

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
  const { language, text } = useLanguage();
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      ? `<script src="${appOrigin}/embed/chat-widget.js" data-tenant-id="${botId}" data-bot-name="${escapeAttr(bot.bot_name)}" data-theme-color="#2563EB" data-greeting-message="${language === "th" ? "สวัสดีครับ มีอะไรให้ช่วยไหมครับ" : "Hello! How can I help you today?"}" data-logo-url=""></script>`
      : "";

  const copyEmbedCode = async () => {
    if (!embedCode) return;
    await navigator.clipboard.writeText(embedCode);
    setCopyResult("copied");
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
      setSaveResult("saved");
    } catch (error) {
      setSaveResult(error instanceof Error ? error.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!botId) return;
    if (!canTest) {
      setTestResult("save_first");
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/dashboard/bots/${botId}/line-connection-test`, { method: "POST" });
      const data = await res.json();
      setTestResult(data.ok ? "connected" : data.message || text("Connection test failed", "ทดสอบการเชื่อมต่อไม่สำเร็จ"));
    } finally {
      setIsTesting(false);
    }
  };

  const deleteCurrentBot = async () => {
    if (!botId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/dashboard/bots/${botId}`, { method: "DELETE" });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "Delete failed");
      window.location.href = "/dashboard/bots";
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Delete failed");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-zinc-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="app-page-header mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">LINE Setup</h1>
            <p className="text-sm text-zinc-600">{text("Configure LINE Developers and the website widget for this agent.", "คู่มือการตั้งค่า LINE Developers และวิดเจ็ตเว็บไซต์สำหรับเอเจนต์ตัวนี้")}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/bots" className="app-button-outline">{text("Back", "กลับ")}</Link>
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="app-button-danger"
            >
              {text("Delete agent", "ลบเอเจนต์")}
            </button>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="app-card p-6">
            <h2 className="text-lg font-semibold">{text("LINE Developers setup guide", "วิธีตั้งค่า LINE Developers")}</h2>
            <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-700">
              <Link href={`/dashboard/bots/${botId || ""}/knowledge`} className="app-button-outline">
                {text("Review Knowledge", "ตรวจสอบคลังความรู้")}
              </Link>
              <Step title={text("1) Create a LINE Messaging API channel", "1) สร้าง LINE Messaging API Channel")}>
                {text("Open LINE Developers Console, create a provider, then create a Messaging API channel.", "เข้า LINE Developers Console แล้วสร้าง Provider ใหม่ จากนั้นสร้าง Channel ประเภท Messaging API")}
                <ExternalDocLink href="https://developers.line.biz/console/" label={text("Open LINE Developers Console", "เปิด LINE Developers Console")} />
                <ExternalDocLink href="https://developers.line.biz/en/docs/messaging-api/getting-started/" label={text("Messaging API getting started guide", "ดูคู่มือเริ่มต้น Messaging API")} />
              </Step>
              <Step title={text("2) Find the Channel Secret", "2) หา Channel Secret")}>
                {text("Open the channel's Basic settings, copy the Channel Secret, and paste it into this agent's Channel Secret field.", "หลังสร้าง channel แล้ว ให้เปิดหน้า Basic settings จะเห็น Channel Secret ให้นำค่านี้มาใส่ในช่อง Channel Secret ของเอเจนต์")}
                <ExternalDocLink href="https://developers.line.biz/console/" label={text("Open the channel in LINE Developers Console", "ไปที่หน้า Channel ใน LINE Developers Console")} />
                <ExternalDocLink href="https://developers.line.biz/en/docs/basics/channel-secret/" label={text("Read about Channel Secret", "อ่านรายละเอียด Channel Secret")} />
              </Step>
              <Step title={text("3) Create a Channel Access Token", "3) สร้าง Channel Access Token")}>
                {text("Open Messaging API settings, issue a long-lived access token, then paste it into the Channel Access Token field.", "เข้า Messaging API settings แล้วกดออก token แบบ long-lived access token จากนั้นคัดลอกมาใส่ในช่อง Channel Access Token")}
                <ExternalDocLink href="https://developers.line.biz/en/docs/messaging-api/channel-access-tokens/" label={text("Channel Access Token guide", "อ่านวิธีสร้าง Channel Access Token")} />
              </Step>
              <Step title={text("4) Set the Webhook URL", "4) ตั้งค่า Webhook URL")}>
                {text("Use this URL as the webhook for this agent.", "ใช้ URL นี้เป็น Webhook ของเอเจนต์ตัวนี้")}
                <div className="mt-2 rounded-2xl border bg-zinc-50 px-4 py-3 font-mono text-xs break-all">{webhookUrl || text("Save the connection to display the webhook URL", "บันทึกการเชื่อมต่อเพื่อแสดง Webhook URL")}</div>
                <ExternalDocLink href="https://developers.line.biz/en/docs/messaging-api/receiving-messages/" label={text("Receiving messages with webhooks", "อ่านคู่มือการรับข้อความผ่าน Webhook")} />
              </Step>
              <Step title={text("5) Enable Use webhook", "5) เปิด Use webhook")}>
                {text("Return to Messaging API settings and enable Use webhook so LINE can send messages to this application.", "กลับไปที่ Messaging API settings แล้วเปิดสวิตช์ Use webhook ให้เป็นเปิด เพื่อให้ข้อความจาก LINE ส่งมาที่ระบบนี้")}
                <ExternalDocLink href="https://developers.line.biz/console/" label={text("Open Messaging API settings", "เปิดหน้า Messaging API settings")} />
                <ExternalDocLink href="https://developers.line.biz/en/docs/messaging-api/receiving-messages/" label={text("Webhook setup guide", "ดูวิธีเปิดและใช้งาน Webhook")} />
              </Step>
              <Step title={text("6) Test the connection", "6) ทดสอบการเชื่อมต่อ")}>
                {text("After saving the Channel Secret and Access Token, select Test Connection to verify that LINE can connect.", "เมื่อบันทึก Channel Secret และ Access Token แล้ว ให้กดปุ่ม Test Connection ด้านล่าง เพื่อตรวจว่าระบบเชื่อมกับ LINE ได้จริง")}
                <ExternalDocLink href="https://developers.line.biz/en/reference/messaging-api/" label={text("Messaging API reference", "ดู Messaging API Reference")} />
              </Step>
            </div>
          </div>

          <div className="app-card p-6">
            <h2 className="text-lg font-semibold">{text("Connection settings", "ตั้งค่าการเชื่อมต่อ")}</h2>
            <div className="mt-4 space-y-3 text-sm text-zinc-700">
              <p>Agent name: {bot?.bot_name || "-"}</p>
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
                  placeholder={text("Enter Channel Secret", "ใส่ Channel Secret")}
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
                  placeholder={text("Enter Channel Access Token", "ใส่ Channel Access Token")}
                />
              </label>
              <button
                onClick={saveConnection}
                disabled={isSaving}
                aria-busy={isSaving}
                className="app-button-primary disabled:opacity-40"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              {saveResult && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saveResult === "saved" ? text("Connection saved successfully.", "บันทึกข้อมูลสำเร็จแล้ว") : saveResult}</div>}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs break-all">
                {webhookUrl || text("Select Save to display the Webhook URL", "กด Save เพื่อแสดง Webhook URL")}
              </div>
              <button
                onClick={testConnection}
                disabled={isTesting || !canTest}
                aria-busy={isTesting}
                className="app-button-primary disabled:opacity-40"
              >
                {isTesting ? "Testing..." : "Test Connection"}
              </button>
              {testResult && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{testResult === "connected" ? text("Connected successfully.", "เชื่อมต่อสำเร็จ") : testResult === "save_first" ? text("Save the connection before testing.", "กรุณากด Save ให้เรียบร้อยก่อน") : testResult}</div>}
            </div>
          </div>
        </section>

        <section className="mt-6 app-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Website Chat Widget</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {text("Place this code before the closing body tag on your website to show the chat button in the bottom-right corner.", "นำโค้ดนี้ไปวางก่อนปิดแท็ก body ของเว็บไซต์ลูกค้า เพื่อแสดงปุ่มแชทมุมขวาล่าง")}
              </p>
            </div>
            <button
              type="button"
              onClick={copyEmbedCode}
              disabled={!embedCode}
              className="app-button-primary disabled:opacity-40"
            >
              Copy Embed Code
            </button>
          </div>
          <pre className="mt-4 overflow-auto rounded-2xl border bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">
            {embedCode || text("Loading embed code...", "กำลังโหลด embed code...")}
          </pre>
          {copyResult && <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{text("Embed code copied.", "คัดลอก embed code แล้ว")}</div>}
        </section>
      </main>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-agent-title" className="app-card w-full max-w-lg p-6 shadow-2xl">
            <h3 id="delete-agent-title" className="text-xl font-semibold text-zinc-950 dark:text-white">{text("Delete this agent?", "ลบเอเจนต์นี้ใช่ไหม")}</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {text("Deleting this agent permanently removes its FAQs, conversation logs, and usage history. This action cannot be undone.", "การลบเอเจนต์จะลบข้อมูล FAQ, บันทึกการสนทนา และประวัติการใช้งานของเอเจนต์ตัวนี้อย่างถาวร และไม่สามารถกู้คืนได้")}
            </p>
            {deleteError && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</div>}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={() => setDeleteConfirmOpen(false)} className="app-button-outline">
                {text("Cancel", "ยกเลิก")}
              </button>
              <button
                type="button"
                onClick={deleteCurrentBot}
                disabled={isDeleting}
                aria-busy={isDeleting}
                className="app-button-danger bg-red-600 text-white disabled:opacity-40"
              >
                {isDeleting ? text("Deleting...", "กำลังลบ...") : text("Delete agent", "ลบเอเจนต์")}
              </button>
            </div>
          </div>
        </div>
      )}
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
