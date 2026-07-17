"use client";
/* eslint-disable @next/next/no-img-element -- blob previews and allowlisted runtime storage URLs are intentionally rendered directly. */

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
import {
  DEFAULT_WIDGET_APPEARANCE,
  WIDGET_OFFSET_MAX,
  getContrastingTextColor,
  normalizeHexColor,
  type WidgetDefaultIcon,
  type WidgetLauncherIconType,
  type WidgetLauncherPosition,
  type WidgetLauncherShape,
} from "@/lib/widget-appearance";

type Settings = {
  botName: string;
  botProfileImageUrl: string | null;
  primaryColor: string;
  launcherIconType: WidgetLauncherIconType;
  defaultIcon: WidgetDefaultIcon;
  customIconUrl: string | null;
  launcherShape: WidgetLauncherShape;
  launcherPosition: WidgetLauncherPosition;
  horizontalOffset: number;
  bottomOffset: number;
  showDismissButton: boolean;
  publicToken: string;
};

const PRESET_COLORS = [
  ["Blue", "#2563EB"], ["Green", "#06C755"], ["Purple", "#7C3AED"],
  ["Orange", "#EA580C"], ["Red", "#DC2626"], ["Black", "#18181B"],
] as const;

const DEFAULT_ICONS: Array<{ id: WidgetDefaultIcon; en: string; th: string }> = [
  { id: "chat", en: "Chat Bubble", th: "กล่องข้อความ" },
  { id: "robot", en: "Robot", th: "หุ่นยนต์" },
  { id: "support", en: "Customer Support", th: "ฝ่ายบริการลูกค้า" },
  { id: "shopping_bag", en: "Shopping Bag", th: "ถุงช้อปปิ้ง" },
  { id: "store", en: "Store", th: "ร้านค้า" },
  { id: "line_message", en: "LINE-style Message", th: "ข้อความสไตล์ LINE" },
];

export default function WidgetAppearanceSettings({ botId }: { botId: number }) {
  const { text } = useLanguage();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [primaryColorInput, setPrimaryColorInput] = useState(DEFAULT_WIDGET_APPEARANCE.primaryColor);
  const [pendingIcon, setPendingIcon] = useState<File | null>(null);
  const [pendingIconUrl, setPendingIconUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewDismissed, setPreviewDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/dashboard/bots/${botId}/widget`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load widget settings");
        return data.widget as Settings;
      })
      .then((widget) => {
        if (!active) return;
        setSettings(widget);
        setPrimaryColorInput(widget.primaryColor);
      })
      .catch((error) => active && setNotice({ type: "error", message: error.message }));
    return () => { active = false; };
  }, [botId, reloadKey]);

  useEffect(() => {
    const reload = () => setReloadKey((value) => value + 1);
    window.addEventListener("widget-profile-updated", reload);
    return () => window.removeEventListener("widget-profile-updated", reload);
  }, []);

  useEffect(() => () => {
    if (pendingIconUrl) URL.revokeObjectURL(pendingIconUrl);
  }, [pendingIconUrl]);

  const validColor = normalizeHexColor(primaryColorInput);
  const previewColor = validColor ?? settings?.primaryColor ?? DEFAULT_WIDGET_APPEARANCE.primaryColor;
  const foregroundColor = getContrastingTextColor(previewColor);
  const previewIconUrl = pendingIconUrl || getSelectedIconUrl(settings);
  const embedCode = useMemo(() => {
    if (!settings || typeof window === "undefined") return "";
    return `<script src="${window.location.origin}/embed/chat-widget.js" data-widget-token="${settings.publicToken}" async></script>`;
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => current ? { ...current, [key]: value } : current);
    setNotice(null);
  };

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(jpe?g|png|webp)$/i.test(file.name) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setNotice({ type: "error", message: text("Choose a JPG, JPEG, PNG, or WebP image.", "กรุณาเลือกไฟล์ JPG, JPEG, PNG หรือ WebP") });
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setNotice({ type: "error", message: text("The image must be 2 MB or smaller.", "รูปต้องมีขนาดไม่เกิน 2 MB") });
      event.target.value = "";
      return;
    }
    if (pendingIconUrl) URL.revokeObjectURL(pendingIconUrl);
    setPendingIcon(file);
    setPendingIconUrl(URL.createObjectURL(file));
    updateSetting("launcherIconType", "custom");
  };

  const save = async () => {
    if (!settings || !validColor) {
      setNotice({ type: "error", message: text("Enter a valid 6-digit HEX color.", "กรุณากรอกสี HEX แบบ 6 หลักให้ถูกต้อง") });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      let nextSettings = settings;
      if (pendingIcon) {
        const formData = new FormData();
        formData.set("icon", pendingIcon);
        const uploadResponse = await fetch(`/api/dashboard/bots/${botId}/widget/launcher-icon`, { method: "POST", body: formData });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.error || "Upload failed");
        nextSettings = { ...nextSettings, customIconUrl: uploadData.customIconUrl, launcherIconType: "custom" };
      }
      const response = await fetch(`/api/dashboard/bots/${botId}/widget`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor: validColor,
          launcherIconType: nextSettings.launcherIconType,
          defaultIcon: nextSettings.defaultIcon,
          launcherShape: nextSettings.launcherShape,
          launcherPosition: nextSettings.launcherPosition,
          horizontalOffset: nextSettings.horizontalOffset,
          bottomOffset: nextSettings.bottomOffset,
          showDismissButton: nextSettings.showDismissButton,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Save failed");
      setSettings(data.widget);
      setPrimaryColorInput(data.widget.primaryColor);
      setPendingIcon(null);
      setPendingIconUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setNotice({ type: "success", message: text("Widget appearance saved.", "บันทึกรูปลักษณ์ Widget แล้ว") });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Save failed" });
    } finally { setBusy(false); }
  };

  const removeCustomIcon = async () => {
    if (!settings) return;
    if (pendingIconUrl) URL.revokeObjectURL(pendingIconUrl);
    setPendingIcon(null); setPendingIconUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!settings.customIconUrl) { updateSetting("launcherIconType", "default"); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/dashboard/bots/${botId}/widget/launcher-icon`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Remove failed");
      setSettings({ ...settings, customIconUrl: null, launcherIconType: "default" });
      setNotice({ type: "success", message: text("Custom icon removed.", "ลบไอคอนที่อัปโหลดแล้ว") });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Remove failed" });
    } finally { setBusy(false); }
  };

  const reset = async () => {
    if (!settings) return;
    setBusy(true); setNotice(null);
    try {
      const response = await fetch(`/api/dashboard/bots/${botId}/widget`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reset: true }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Reset failed");
      setSettings(data.widget); setPrimaryColorInput(data.widget.primaryColor); setPendingIcon(null); setPendingIconUrl(null); setPreviewDismissed(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setNotice({ type: "success", message: text("Reset to the default blue theme and chat icon.", "รีเซ็ตเป็นธีมสีฟ้าและไอคอนแชทเริ่มต้นแล้ว") });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Reset failed" });
    } finally { setBusy(false); }
  };

  if (!settings) return <section className="mt-6 app-card p-6" aria-busy="true">{notice?.message || text("Loading widget settings…", "กำลังโหลดการตั้งค่า Widget…")}</section>;

  return (
    <section className="mt-6 app-card overflow-hidden p-0">
      <div className="border-b border-zinc-200 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Website Chat Widget</p><h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">{text("Appearance & embed", "หน้าตาและโค้ดฝัง")}</h2><p className="mt-1 text-sm text-zinc-600">{text("Customize this bot's launcher and see every change instantly.", "ปรับปุ่มเปิดแชทของ Bot นี้และดูผลลัพธ์ได้ทันที")}</p></div>
          <div className="flex flex-wrap gap-2"><Link href={`/dashboard/bots/${botId}/widget-demo`} className="app-button-outline min-h-11">{text("Open real demo", "เปิด Demo จริง")}</Link><button type="button" onClick={reset} disabled={busy} className="app-button-outline min-h-11 disabled:opacity-40">{text("Reset default", "รีเซ็ตค่าเริ่มต้น")}</button><button type="button" onClick={save} disabled={busy || !validColor} aria-busy={busy} className="app-button-primary min-h-11 disabled:opacity-40">{busy ? text("Saving…", "กำลังบันทึก…") : text("Save appearance", "บันทึกรูปลักษณ์")}</button></div>
        </div>
        {notice && <div aria-live="polite" className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>{notice.message}</div>}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="space-y-8 px-5 py-6 sm:px-6">
          <fieldset>
            <legend className="text-base font-semibold text-zinc-900 dark:text-white">1. {text("Primary color", "สีหลัก")}</legend>
            <p className="mt-1 text-sm text-zinc-500">{text("Applied to the launcher, header, send button, message bubble, and accents.", "ใช้กับปุ่มเปิดแชท, Header, ปุ่มส่ง, กล่องข้อความ และส่วนเน้น")}</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 focus-within:ring-2 focus-within:ring-blue-500">
                <input aria-label={text("Choose primary color", "เลือกสีหลัก")} type="color" value={previewColor} onChange={(event) => setPrimaryColorInput(event.target.value.toUpperCase())} className="h-8 w-10 cursor-pointer border-0 bg-transparent p-0" />
                <input aria-label={text("Primary color HEX", "ค่าสีหลัก HEX")} value={primaryColorInput} onChange={(event) => setPrimaryColorInput(event.target.value.toUpperCase())} maxLength={7} spellCheck={false} className="min-w-0 flex-1 bg-transparent font-mono text-sm uppercase text-zinc-900 outline-none" placeholder="#2563EB" aria-invalid={!validColor} />
                <span className="h-7 w-7 rounded-full border border-black/10" style={{ backgroundColor: previewColor }} aria-hidden="true" />
              </label>
              <div className="flex min-h-12 items-center rounded-2xl bg-zinc-100 px-4 text-xs font-medium text-zinc-600">{foregroundColor === "#FFFFFF" ? text("White text", "ข้อความสีขาว") : text("Dark text", "ข้อความสีเข้ม")} · {text("auto contrast", "ปรับ Contrast อัตโนมัติ")}</div>
            </div>
            {!validColor && <p className="mt-2 text-sm text-red-600">{text("Use a 6-digit HEX value, for example #06C755.", "ใช้ค่า HEX 6 หลัก เช่น #06C755")}</p>}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {PRESET_COLORS.map(([name, value]) => <button key={value} type="button" onClick={() => setPrimaryColorInput(value)} aria-pressed={previewColor === value} className="min-h-11 rounded-xl border border-zinc-200 bg-white px-2 py-2 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 focus-visible:ring-2 focus-visible:ring-blue-500" title={value}><span className="mx-auto mb-1 block h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: value }} />{name}</button>)}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-base font-semibold text-zinc-900 dark:text-white">2. {text("Launcher icon", "ไอคอนปุ่มเปิดแชท")}</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <IconTypeButton selected={settings.launcherIconType === "default"} onClick={() => updateSetting("launcherIconType", "default")} title={text("Default icon", "ไอคอนเริ่มต้น")} description={text("Choose from 6 icons", "เลือกได้ 6 แบบ")} />
              <IconTypeButton selected={settings.launcherIconType === "bot_profile"} onClick={() => updateSetting("launcherIconType", "bot_profile")} disabled={!settings.botProfileImageUrl} title={text("Bot profile", "รูปโปรไฟล์ Bot")} description={settings.botProfileImageUrl ? text("Use existing profile", "ใช้รูปที่มีอยู่") : text("No profile image", "ยังไม่มีรูปโปรไฟล์")} />
              <IconTypeButton selected={settings.launcherIconType === "custom"} onClick={() => updateSetting("launcherIconType", "custom")} disabled={!settings.customIconUrl && !pendingIcon} title={text("Custom upload", "อัปโหลดเอง")} description={text("JPG, PNG or WebP", "JPG, PNG หรือ WebP")} />
            </div>
            {settings.launcherIconType === "default" && <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">{DEFAULT_ICONS.map((icon) => <button key={icon.id} type="button" onClick={() => updateSetting("defaultIcon", icon.id)} aria-pressed={settings.defaultIcon === icon.id} aria-label={text(icon.en, icon.th)} className={`grid min-h-16 place-items-center rounded-2xl border transition focus-visible:ring-2 focus-visible:ring-blue-500 ${settings.defaultIcon === icon.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"}`}><WidgetIcon name={icon.id} className="h-7 w-7" /></button>)}</div>}
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className={`grid h-16 w-16 shrink-0 place-items-center overflow-hidden bg-white ring-1 ring-zinc-200 ${settings.launcherShape === "circle" ? "rounded-full" : "rounded-2xl"}`}>{previewIconUrl ? <img src={previewIconUrl} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : <WidgetIcon name={settings.defaultIcon} className="h-8 w-8 text-zinc-600" />}</div>
                <div className="min-w-0 flex-1"><p className="text-sm font-medium text-zinc-800">{text("Upload a square image", "อัปโหลดรูปสี่เหลี่ยมจัตุรัส")}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{text("Maximum 2 MB. The widget crops it automatically to the selected shape.", "ขนาดไม่เกิน 2 MB โดย Widget จะ Crop ตามรูปทรงที่เลือกอัตโนมัติ")}</p></div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={chooseFile} className="sr-only" id={`widget-icon-${botId}`} /><label htmlFor={`widget-icon-${botId}`} className="app-button-outline min-h-11 cursor-pointer text-center">{text("Choose image", "เลือกรูป")}</label>
              </div>
              {(pendingIcon || settings.customIconUrl) && <button type="button" onClick={removeCustomIcon} disabled={busy} className="mt-3 min-h-11 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-40">{text("Remove custom icon", "ลบไอคอนที่อัปโหลด")}</button>}
            </div>
          </fieldset>

          <fieldset><legend className="text-base font-semibold text-zinc-900 dark:text-white">3. {text("Launcher shape", "รูปทรงปุ่ม")}</legend><div className="mt-4 grid grid-cols-2 gap-3">{(["circle", "rounded"] as WidgetLauncherShape[]).map((shape) => <button key={shape} type="button" onClick={() => updateSetting("launcherShape", shape)} aria-pressed={settings.launcherShape === shape} className={`min-h-12 rounded-2xl border px-4 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500 ${settings.launcherShape === shape ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-200 bg-white text-zinc-700"}`}>{shape === "circle" ? text("Circle", "วงกลม") : text("Rounded square", "สี่เหลี่ยมมุมโค้ง")}</button>)}</div></fieldset>

          <fieldset>
            <legend className="text-base font-semibold text-zinc-900 dark:text-white">4. {text("Position & spacing", "ตำแหน่งและระยะห่าง")}</legend>
            <p className="mt-1 text-sm text-zinc-500">{text("Choose a bottom corner and set the distance from the screen edges.", "เลือกมุมด้านล่างและกำหนดระยะห่างจากขอบหน้าจอ")}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(["left", "right"] as WidgetLauncherPosition[]).map((position) => <button key={position} type="button" onClick={() => updateSetting("launcherPosition", position)} aria-pressed={settings.launcherPosition === position} className={`min-h-12 rounded-2xl border px-4 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-blue-500 ${settings.launcherPosition === position ? "border-blue-500 bg-blue-50 text-blue-700" : "border-zinc-200 bg-white text-zinc-700"}`}>{position === "left" ? text("Bottom left", "ล่างซ้าย") : text("Bottom right", "ล่างขวา")}</button>)}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <OffsetInput label={text("Distance from side", "ระยะจากขอบด้านข้าง")} value={settings.horizontalOffset} onChange={(value) => updateSetting("horizontalOffset", value)} />
              <OffsetInput label={text("Distance from bottom", "ระยะจากขอบด้านล่าง")} value={settings.bottomOffset} onChange={(value) => updateSetting("bottomOffset", value)} />
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-base font-semibold text-zinc-900 dark:text-white">5. {text("Bubble visibility", "การซ่อน Bubble")}</legend>
            <button type="button" role="switch" aria-checked={settings.showDismissButton} onClick={() => { updateSetting("showDismissButton", !settings.showDismissButton); setPreviewDismissed(false); }} className="mt-4 flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-4 text-left focus-visible:ring-2 focus-visible:ring-blue-500">
              <span><span className="block text-sm font-semibold text-zinc-900">{text("Show hide/show control", "แสดงปุ่มซ่อน/แสดง Bubble")}</span><span className="mt-1 block text-xs leading-5 text-zinc-500">{text("Visitors can temporarily hide the launcher and bring it back.", "ผู้เข้าชมสามารถซ่อนปุ่มแชทชั่วคราวและเรียกกลับมาได้")}</span></span>
              <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${settings.showDismissButton ? "bg-blue-600" : "bg-zinc-300"}`} aria-hidden="true"><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${settings.showDismissButton ? "left-6" : "left-1"}`} /></span>
            </button>
          </fieldset>
        </div>

        <aside className="border-t border-zinc-200 bg-zinc-100/80 p-4 sm:p-6 lg:border-l lg:border-t-0">
          <div className="lg:sticky lg:top-6">
            <div className="mb-3 flex items-center justify-between"><div><h3 className="font-semibold text-zinc-900">{text("Live preview", "ตัวอย่างแบบ Real-time")}</h3><p className="text-xs text-zinc-500">Desktop · Mobile responsive</p></div><button type="button" onClick={() => setPreviewOpen((value) => !value)} aria-pressed={previewOpen} className="min-h-11 rounded-full border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-700">{previewOpen ? text("Show launcher", "ดูปุ่มเปิด") : text("Open chat", "เปิดแชท")}</button></div>
            <div className="relative min-h-[570px] overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-inner" style={{ backgroundImage: "linear-gradient(#e4e4e7 1px, transparent 1px), linear-gradient(90deg, #e4e4e7 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
              <div className="absolute left-5 top-5 h-3 w-28 rounded-full bg-zinc-200" /><div className="absolute left-5 top-11 h-2 w-44 rounded-full bg-zinc-100" />
              {previewOpen ? <ChatPreview settings={settings} previewColor={previewColor} foregroundColor={foregroundColor} previewIconUrl={previewIconUrl} close={() => setPreviewOpen(false)} text={text} /> : <LauncherPreview settings={settings} previewColor={previewColor} foregroundColor={foregroundColor} previewIconUrl={previewIconUrl} dismissed={previewDismissed} open={() => setPreviewOpen(true)} dismiss={() => setPreviewDismissed(true)} restore={() => setPreviewDismissed(false)} text={text} />}
            </div>
            <div className="mt-5 rounded-2xl bg-zinc-950 p-4 text-zinc-100"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Embed code</p><button type="button" onClick={async () => { await navigator.clipboard.writeText(embedCode); setNotice({ type: "success", message: text("Embed code copied.", "คัดลอกโค้ดฝังแล้ว") }); }} className="min-h-11 rounded-full bg-white/10 px-4 text-xs font-medium hover:bg-white/15">{text("Copy code", "คัดลอกโค้ด")}</button></div><pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all text-xs leading-6 text-blue-200">{embedCode}</pre><p className="mt-2 text-xs leading-5 text-zinc-400">{text("The public token identifies this widget without exposing the bot's internal ID or LINE credentials.", "Public token ใช้ระบุ Widget โดยไม่เปิดเผย Bot ID ภายในหรือข้อมูล LINE")}</p></div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ChatPreview({ settings, previewColor, foregroundColor, previewIconUrl, close, text }: { settings: Settings; previewColor: string; foregroundColor: string; previewIconUrl: string | null; close: () => void; text: (en: string, th: string) => string }) {
  const edgeOffset = previewOffset(settings.horizontalOffset);
  const bottomOffset = previewOffset(settings.bottomOffset);
  const sideStyle = settings.launcherPosition === "left" ? { left: edgeOffset } : { right: edgeOffset };
  return <div className="absolute flex h-[455px] max-w-[380px] flex-col overflow-hidden rounded-[22px] border border-black/10 bg-white shadow-2xl" style={{ ...sideStyle, bottom: bottomOffset, width: `calc(100% - ${edgeOffset + 12}px)` }}><div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: previewColor, color: foregroundColor }}><div className="flex min-w-0 items-center gap-2.5"><div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white/90">{previewIconUrl ? <img src={previewIconUrl} alt="" className="h-full w-full object-cover" /> : <WidgetIcon name={settings.defaultIcon} className="h-5 w-5 text-zinc-700" />}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{settings.botName}</p><p className="text-[10px] opacity-80">● Online</p></div></div><button type="button" aria-label={text("Close preview chat", "ปิดตัวอย่างแชท")} onClick={close} className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-lg">×</button></div><div className="flex-1 space-y-3 bg-zinc-50 p-4 text-xs"><div className="max-w-[82%] rounded-2xl rounded-tl-md border border-zinc-200 bg-white px-3 py-2.5 text-zinc-700 shadow-sm">{text("Hello! How can I help you today?", "สวัสดีครับ มีอะไรให้ช่วยไหมครับ")}</div><div className="ml-auto max-w-[82%] rounded-2xl rounded-tr-md px-3 py-2.5 shadow-sm" style={{ backgroundColor: previewColor, color: foregroundColor }}>{text("I'd like to know more about your products.", "อยากทราบข้อมูลสินค้าเพิ่มเติมครับ")}</div><div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-md border border-zinc-200 bg-white px-3 py-3" aria-label={text("Loading", "กำลังโหลด")}>{[0, 1, 2].map((dot) => <span key={dot} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: previewColor, opacity: 1 - dot * 0.2 }} />)}</div></div><div className="flex gap-2 border-t border-zinc-200 bg-white p-3"><div className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-xs text-zinc-400">{text("Type a message…", "พิมพ์ข้อความ…")}</div><div className="grid h-10 w-10 place-items-center rounded-full" style={{ backgroundColor: previewColor, color: foregroundColor }}><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg></div></div></div>;
}

function LauncherPreview({ settings, previewColor, foregroundColor, previewIconUrl, dismissed, open, dismiss, restore, text }: { settings: Settings; previewColor: string; foregroundColor: string; previewIconUrl: string | null; dismissed: boolean; open: () => void; dismiss: () => void; restore: () => void; text: (en: string, th: string) => string }) {
  const sideStyle = settings.launcherPosition === "left" ? { left: previewOffset(settings.horizontalOffset) } : { right: previewOffset(settings.horizontalOffset) };
  return <div className="absolute" style={{ ...sideStyle, bottom: previewOffset(settings.bottomOffset) }}>
    {dismissed ? <button type="button" onClick={restore} aria-label={text("Show chat bubble", "แสดง Chat Bubble")} className="grid h-10 w-10 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-lg"><WidgetIcon name="chat" className="h-5 w-5" /></button> : <div className="relative">
      <button type="button" onClick={open} aria-label={text("Open preview chat", "เปิดตัวอย่างแชท")} className={`grid h-16 w-16 place-items-center overflow-hidden shadow-xl transition ${settings.launcherShape === "circle" ? "rounded-full" : "rounded-[20px]"}`} style={{ backgroundColor: previewColor, color: foregroundColor }}>{previewIconUrl ? <img src={previewIconUrl} alt="" className="h-full w-full object-cover" /> : <WidgetIcon name={settings.defaultIcon} className="h-8 w-8" />}</button>
      {settings.showDismissButton && <button type="button" onClick={dismiss} aria-label={text("Hide chat bubble", "ซ่อน Chat Bubble")} className={`absolute -top-2 grid h-6 w-6 place-items-center rounded-full border border-zinc-200 bg-white text-xs font-bold text-zinc-600 shadow-md ${settings.launcherPosition === "left" ? "-right-2" : "-left-2"}`}>×</button>}
    </div>}
  </div>;
}

function OffsetInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="rounded-2xl border border-zinc-200 bg-white px-4 py-3"><span className="block text-xs font-medium text-zinc-600">{label}</span><span className="mt-2 flex items-center gap-2"><input type="number" min={0} max={WIDGET_OFFSET_MAX} step={1} value={value} onChange={(event) => { const next = Number(event.target.value); if (Number.isInteger(next) && next >= 0 && next <= WIDGET_OFFSET_MAX) onChange(next); }} className="min-w-0 flex-1 bg-transparent font-mono text-sm text-zinc-900 outline-none" /><span className="text-xs text-zinc-400">px</span></span></label>;
}

function previewOffset(value: number) {
  return Math.min(value, 96);
}

function IconTypeButton({ selected, disabled, onClick, title, description }: { selected: boolean; disabled?: boolean; onClick: () => void; title: string; description: string }) {
  return <button type="button" onClick={onClick} disabled={disabled} aria-pressed={selected} className={`min-h-20 rounded-2xl border p-3 text-left transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-45 ${selected ? "border-blue-500 bg-blue-50" : "border-zinc-200 bg-white hover:border-zinc-400"}`}><span className="block text-sm font-semibold text-zinc-900">{title}</span><span className="mt-1 block text-xs text-zinc-500">{description}</span></button>;
}

function getSelectedIconUrl(settings: Settings | null) {
  if (!settings) return null;
  if (settings.launcherIconType === "bot_profile") return settings.botProfileImageUrl;
  if (settings.launcherIconType === "custom") return settings.customIconUrl;
  return null;
}

export function WidgetIcon({ name, className }: { name: WidgetDefaultIcon; className?: string }) {
  const common = { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "robot") return <svg {...common}><rect x="4" y="7" width="16" height="13" rx="4" /><path d="M12 3v4M9 3h6M8 12h.01M16 12h.01M8 16h8" /></svg>;
  if (name === "support") return <svg {...common}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2v1ZM20 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2v1ZM17 16c0 3-2 4-5 4" /></svg>;
  if (name === "shopping_bag") return <svg {...common}><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></svg>;
  if (name === "store") return <svg {...common}><path d="M4 10v11h16V10M3 10l2-6h14l2 6" /><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M9 21v-6h6v6" /></svg>;
  if (name === "line_message") return <svg {...common}><path d="M21 11.5c0 4.7-4.3 8.5-9.5 8.5a11 11 0 0 1-2.4-.3L4 22l1.5-4.2A8 8 0 0 1 2 11.5C2 6.8 6.3 3 11.5 3S21 6.8 21 11.5Z" /><path d="M7 12h.01M11.5 12h.01M16 12h.01" /></svg>;
  return <svg {...common}><path d="M21 12a8 8 0 0 1-9 8 9 9 0 0 1-3.8-.8L3 21l1.7-4.5A8.5 8.5 0 1 1 21 12Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></svg>;
}
