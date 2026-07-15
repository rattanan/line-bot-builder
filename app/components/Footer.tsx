"use client";

import packageJson from "@/package.json";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "./BrandLogo";
import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const pathname = usePathname();
  const { text } = useLanguage();

  if (pathname === "/") {
    return (
      <footer className="border-t border-slate-200 bg-white px-4 py-10 text-slate-600 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <BrandLogo href="#hero" markClassName="h-10 w-10 shrink-0" />
            <p className="mt-3 max-w-md text-sm leading-6">{text("Create your AI-powered sales assistant, build knowledge automatically, and deploy to LINE and your website in minutes.", "สร้างผู้ช่วยฝ่ายขาย AI ให้ระบบสร้างคลังความรู้อัตโนมัติ แล้วเชื่อมต่อ LINE และเว็บไซต์ได้ในไม่กี่นาที")}</p>
          </div>
          <div className="flex flex-col gap-4 text-sm sm:items-end">
            <div className="flex flex-wrap gap-x-5 gap-y-2 font-medium"><Link href="#how-it-works" className="hover:text-blue-700 dark:hover:text-blue-300">{text("How it works", "วิธีการทำงาน")}</Link><Link href="#features" className="hover:text-blue-700 dark:hover:text-blue-300">{text("Features", "ฟีเจอร์")}</Link><Link href="/chat-test" className="hover:text-blue-700 dark:hover:text-blue-300">{text("Live Demo", "ทดลองใช้งาน")}</Link><Link href="/login" className="hover:text-blue-700 dark:hover:text-blue-300">{text("Sign in", "เข้าสู่ระบบ")}</Link></div>
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} AI Sales Companion · {text("Every Conversation Makes You Grow", "ทุกบทสนทนาทำให้คุณเติบโต")}</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-slate-200/70 bg-white/70 px-4 py-4 text-center text-xs text-slate-400 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <span>{text("Version", "เวอร์ชัน")} {packageJson.version}</span>
      </div>
    </footer>
  );
}
