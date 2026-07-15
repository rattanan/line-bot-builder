"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage, text } = useLanguage();

  return (
    <div
      className="fixed bottom-4 right-4 z-[80] flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90"
      role="group"
      aria-label={text("Choose language", "เลือกภาษา")}
    >
      <span className="px-1.5 text-[11px] font-bold text-slate-400" aria-hidden="true">A/ก</span>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`min-h-8 rounded-xl px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${language === "en" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"}`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage("th")}
        aria-pressed={language === "th"}
        className={`min-h-8 rounded-xl px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${language === "th" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"}`}
      >
        ไทย
      </button>
    </div>
  );
}
