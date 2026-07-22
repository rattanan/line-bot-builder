"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "./BrandLogo";
import AppIcon, { type AppIconName } from "./AppIcon";
import { type AppLanguage, useLanguage } from "./LanguageProvider";

type SessionUser = {
  email: string;
  fullName: string;
  role: string;
} | null;

type NavItem = {
  href: string;
  label: Record<AppLanguage, string>;
  icon: AppIconName;
  exact?: boolean;
};

const workspaceNavigation: NavItem[] = [
  { href: "/dashboard", label: { en: "Overview", th: "ภาพรวม" }, icon: "dashboard", exact: true },
  { href: "/dashboard/bots", label: { en: "Agents", th: "เอเจนต์" }, icon: "agents" },
  { href: "/chat-test", label: { en: "Chat Test", th: "ทดสอบแชท" }, icon: "activity", exact: true },
  { href: "/dashboard/insights", label: { en: "AI Business Insight", th: "ข้อมูลเชิงลึก AI" }, icon: "sparkles" },
];

const accountNavigation: NavItem[] = [
  { href: "/dashboard/topup", label: { en: "Credits & Billing", th: "เครดิตและการชำระเงิน" }, icon: "wallet", exact: true },
  { href: "/dashboard/topup/history", label: { en: "Billing History", th: "ประวัติการชำระเงิน" }, icon: "history" },
];

const pageNames: Array<[RegExp, Record<AppLanguage, string>]> = [
  [/^\/dashboard$/, { en: "Overview", th: "ภาพรวม" }],
  [/^\/dashboard\/help/, { en: "Help Center", th: "ศูนย์ช่วยเหลือ" }],
  [/^\/dashboard\/bots\/new$/, { en: "Create Agent", th: "สร้างเอเจนต์" }],
  [/\/knowledge$/, { en: "Knowledge", th: "คลังความรู้" }],
  [/\/faqs$/, { en: "FAQ Management", th: "จัดการ FAQ" }],
  [/\/usage$/, { en: "Usage", th: "การใช้งาน" }],
  [/\/widget-demo$/, { en: "Widget Demo", th: "ทดลอง Widget" }],
  [/\/settings$/, { en: "Agent Settings", th: "ตั้งค่าเอเจนต์" }],
  [/^\/dashboard\/bots/, { en: "Agents", th: "เอเจนต์" }],
  [/^\/dashboard\/insights/, { en: "AI Business Insight", th: "ข้อมูลเชิงลึก AI" }],
  [/^\/dashboard\/topup\/history/, { en: "Billing History", th: "ประวัติการชำระเงิน" }],
  [/^\/dashboard\/topup/, { en: "Credits & Billing", th: "เครดิตและการชำระเงิน" }],
  [/^\/admin\/users/, { en: "User Management", th: "จัดการผู้ใช้" }],
  [/^\/admin\/bots/, { en: "Agent Administration", th: "จัดการเอเจนต์" }],
  [/^\/admin\/topup-reviews/, { en: "Top-up Reviews", th: "ตรวจสอบการเติมเงิน" }],
  [/^\/admin/, { en: "Administration", th: "ผู้ดูแลระบบ" }],
  [/^\/chat-log/, { en: "Conversation Log", th: "บันทึกการสนทนา" }],
  [/^\/chat-test/, { en: "Agent Chat Test", th: "ทดสอบแชทเอเจนต์" }],
  [/^\/faq/, { en: "FAQ Library", th: "คลัง FAQ" }],
];

const authPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

function isItemActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavigationItem({ item, pathname, collapsed, language, onNavigate }: { item: NavItem; pathname: string; collapsed: boolean; language: AppLanguage; onNavigate: () => void }) {
  const active = isItemActive(pathname, item);
  const label = item.label[language];
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-400/10 dark:text-blue-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"} ${collapsed ? "justify-center" : ""}`}
    >
      <AppIcon name={item.icon} className="h-[1.15rem] w-[1.15rem] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export default function Header() {
  const [user, setUser] = useState<SessionUser>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { language, text } = useLanguage();
  const isAuthPage = authPaths.some((path) => pathname === path);
  const pageName = pageNames.find(([pattern]) => pattern.test(pathname))?.[1][language] || text("Workspace", "พื้นที่ทำงาน");

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const text = await res.text();
        const data = text ? JSON.parse(text) : { user: null };
        setUser(data.user ?? null);
      } catch {
        setUser(null);
      }
    };
    loadSession();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  if (isAuthPage) {
    return (
      <header className="app-auth-header sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 sm:px-6">
        <nav className="mx-auto flex max-w-6xl items-center justify-between" aria-label={text("Authentication navigation", "เมนูการยืนยันตัวตน")}>
          <BrandLogo markClassName="h-10 w-10 shrink-0" />
          <p className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">{text("Every Conversation Makes You Grow", "ทุกบทสนทนาทำให้คุณเติบโต")}</p>
        </nav>
      </header>
    );
  }

  return (
    <>
      <aside className={`app-sidebar ${collapsed ? "is-collapsed" : ""} fixed inset-y-0 left-0 z-[60] flex w-70 flex-col border-r border-slate-200/80 bg-white/90 p-3 shadow-[8px_0_30px_rgba(15,23,42,0.035)] backdrop-blur-xl transition-[width,transform] duration-200 dark:border-white/10 dark:bg-slate-950/92 lg:translate-x-0 ${collapsed ? "lg:w-21" : "lg:w-70"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`} aria-label={text("Application sidebar", "แถบเมนูแอปพลิเคชัน")}>
        <div className={`flex h-13 items-center ${collapsed ? "justify-center" : "justify-between px-1"}`}>
          <BrandLogo showName={!collapsed} markClassName="h-10 w-10 shrink-0" nameClassName="text-sm font-bold tracking-[-0.02em] text-slate-950 dark:text-white" />
          {!collapsed && <button type="button" onClick={() => setCollapsed(true)} className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/10 dark:hover:text-white lg:flex" aria-label={text("Collapse sidebar", "ย่อแถบเมนู")}><AppIcon name="collapse" /></button>}
        </div>

        {collapsed && <button type="button" onClick={() => setCollapsed(false)} className="mx-auto mt-2 hidden h-9 w-9 rotate-180 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/10 dark:hover:text-white lg:flex" aria-label={text("Expand sidebar", "ขยายแถบเมนู")}><AppIcon name="collapse" /></button>}

        <div className="mt-7 flex-1 overflow-y-auto">
          {!collapsed && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{text("Workspace", "พื้นที่ทำงาน")}</p>}
          <nav className="space-y-1" aria-label={text("Workspace navigation", "เมนูพื้นที่ทำงาน")}>
            {workspaceNavigation.map((item) => <NavigationItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} language={language} onNavigate={() => setMobileOpen(false)} />)}
          </nav>

          {!collapsed && <p className="mb-2 mt-7 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{text("Account", "บัญชี")}</p>}
          <nav className={`${collapsed ? "mt-6" : ""} space-y-1`} aria-label={text("Account navigation", "เมนูบัญชี")}>
            {accountNavigation.map((item) => <NavigationItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} language={language} onNavigate={() => setMobileOpen(false)} />)}
            {user?.role === "ADMIN" && <NavigationItem item={{ href: "/admin/users", label: { en: "Administration", th: "ผู้ดูแลระบบ" }, icon: "users" }} pathname={pathname} collapsed={collapsed} language={language} onNavigate={() => setMobileOpen(false)} />}
          </nav>
        </div>

        <div className="border-t border-slate-200 pt-3 dark:border-white/10">
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 text-xs font-bold text-blue-700 dark:from-blue-400/20 dark:to-violet-400/20 dark:text-blue-300">{user?.fullName?.charAt(0).toUpperCase() || "A"}</span>
            {!collapsed && <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">{user?.fullName || text("Account", "บัญชี")}</p><p className="truncate text-[10px] text-slate-500">{user?.email || text("Loading profile…", "กำลังโหลดข้อมูล…")}</p></div>}
            {!collapsed && <button type="button" onClick={handleLogout} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-red-400/10" aria-label={text("Log out", "ออกจากระบบ")}><AppIcon name="logout" className="h-4 w-4" /></button>}
          </div>
        </div>
      </aside>

      {mobileOpen && <button type="button" className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-label={text("Close navigation", "ปิดเมนู")} />}

      <header className="app-topbar sticky top-0 z-40 flex h-18 items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => setMobileOpen(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-white lg:hidden" aria-label={text("Open navigation", "เปิดเมนู")}><AppIcon name="menu" /></button>
          <div className="min-w-0"><div className="flex items-center gap-1 text-[11px] font-medium text-slate-400"><span>AI Sales Companion</span><AppIcon name="chevron" className="h-3 w-3" /></div><h1 className="truncate text-base font-semibold tracking-tight text-slate-950 dark:text-white">{pageName}</h1></div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/help"
            aria-current={pathname === "/dashboard/help" ? "page" : undefined}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${pathname === "/dashboard/help" ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-300" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:border-blue-400/30 dark:hover:text-blue-300"}`}
          >
            <AppIcon name="help" className="h-4 w-4" />
            <span className="hidden sm:inline">{text("Help", "ช่วยเหลือ")}</span>
          </Link>
          <Link href="/dashboard/bots/new" className="hidden min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:inline-flex"><AppIcon name="plus" className="h-4 w-4" />{text("New Agent", "สร้างเอเจนต์")}</Link>
          <button type="button" onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-200 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 sm:hidden" aria-label={text("Log out", "ออกจากระบบ")}><AppIcon name="logout" className="h-4 w-4" /></button>
        </div>
      </header>
    </>
  );
}
