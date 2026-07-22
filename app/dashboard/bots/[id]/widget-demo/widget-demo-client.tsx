"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";

type Props = {
  botId: number;
  botName: string;
  widgetToken: string;
};

const WIDGET_ROOT_ID = "line-bot-builder-chat";

export default function WidgetDemoClient({ botId, botName, widgetToken }: Props) {
  const { text } = useLanguage();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    document.getElementById(WIDGET_ROOT_ID)?.remove();

    const script = document.createElement("script");
    script.src = "/embed/chat-widget.js";
    script.dataset.widgetToken = widgetToken;
    script.async = true;
    script.dataset.widgetDemo = "true";
    document.body.appendChild(script);

    return () => {
      script.remove();
      document.getElementById(WIDGET_ROOT_ID)?.remove();
    };
  }, [widgetToken, reloadKey]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="app-page-header flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
            Website Chat Widget
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {text("Real embed demo", "ทดลอง Embed จริง")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            {text(
              `This page loads the actual widget script for ${botName}, using the saved appearance and live chat API.`,
              `หน้านี้โหลด Widget script จริงของ ${botName} โดยใช้รูปลักษณ์ที่บันทึกไว้และ Chat API จริง`
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="app-button-outline"
          >
            {text("Reload widget", "โหลด Widget ใหม่")}
          </button>
          <Link href={`/dashboard/bots/${botId}/settings`} className="app-button-primary">
            {text("Back to settings", "กลับไปหน้าตั้งค่า")}
          </Link>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950">
        <div className="border-b border-slate-200/80 px-6 py-4 dark:border-white/10">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
            <div className="ml-3 h-8 flex-1 rounded-lg bg-slate-100 dark:bg-white/[0.06]" />
          </div>
        </div>

        <div className="relative min-h-[660px] overflow-hidden bg-slate-50 px-6 py-14 dark:bg-slate-900 sm:px-10 lg:px-16">
          <div className="absolute inset-0 opacity-60 dark:opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.35) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative max-w-2xl">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
              {text("Demo website", "เว็บไซต์ตัวอย่าง")}
            </span>
            <h3 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl">
              {text("Try your website assistant", "ทดลองผู้ช่วยบนเว็บไซต์ของคุณ")}
            </h3>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
              {text(
                "Open the chat button in the bottom-right corner and send a message. This is the same experience your website visitors will receive.",
                "เปิดปุ่มแชทที่มุมขวาล่างแล้วลองส่งข้อความ ประสบการณ์ในหน้านี้เหมือนกับที่ผู้เข้าชมเว็บไซต์จะได้รับ"
              )}
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[text("Saved appearance", "รูปลักษณ์ที่บันทึกไว้"), text("Live chat response", "คำตอบจากระบบจริง")].map((label) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200">
                  <span className="mr-2 text-emerald-500">●</span>{label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
