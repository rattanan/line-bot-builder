"use client";

import Header from "@/app/components/Header";
import AppIcon from "@/app/components/AppIcon";
import { useLanguage } from "@/app/components/LanguageProvider";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type AnswerSource = "mysql_faq" | "ai" | "fallback";

type Message = {
  id: string;
  text: string;
  sender: "user" | "agent";
  source?: AnswerSource;
  timestamp: Date;
};

type Agent = {
  id: number;
  bot_name: string;
  business_name: string;
  credit_balance: number;
  status: "active" | "suspended";
};

type FAQ = {
  id: number;
  question: string;
  is_active: 0 | 1;
  faq_status?: "draft" | "active" | "archived";
};

function sourceStyles(source: AnswerSource) {
  if (source === "mysql_faq") return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300";
  if (source === "ai") return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300";
  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300";
}

export default function ChatTestPage() {
  const { text } = useLanguage();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [faqSuggestions, setFaqSuggestions] = useState<FAQ[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId]
  );

  useEffect(() => {
    let active = true;
    async function loadAgents() {
      try {
        const response = await fetch("/api/dashboard/bots");
        if (!response.ok) throw new Error(text("Unable to load agents.", "ไม่สามารถโหลดเอเจนต์ได้"));
        const data = (await response.json()) as Agent[];
        if (!active) return;
        setAgents(data);
        setSelectedAgentId(data.find((agent) => agent.status === "active")?.id ?? data[0]?.id ?? null);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : text("Unable to load agents.", "ไม่สามารถโหลดเอเจนต์ได้"));
      } finally {
        if (active) setIsLoadingAgents(false);
      }
    }
    void loadAgents();
    return () => { active = false; };
  }, [text]);

  useEffect(() => {
    if (!selectedAgentId) return;
    let active = true;
    async function loadFaqSuggestions() {
      setIsLoadingFaqs(true);
      try {
        const response = await fetch(`/api/dashboard/bots/${selectedAgentId}/faqs`);
        if (!response.ok) throw new Error();
        const data = (await response.json()) as FAQ[];
        if (!active) return;
        setFaqSuggestions(
          data.filter((faq) => faq.is_active === 1 && faq.faq_status !== "draft" && faq.faq_status !== "archived").slice(0, 4)
        );
      } catch {
        if (active) setFaqSuggestions([]);
      } finally {
        if (active) setIsLoadingFaqs(false);
      }
    }
    void loadFaqSuggestions();
    return () => { active = false; };
  }, [selectedAgentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isSending]);

  const sourceLabel = (source: AnswerSource) => {
    if (source === "mysql_faq") return text("FAQ match", "ตรงกับ FAQ");
    if (source === "ai") return text("AI-generated", "สร้างโดย AI");
    return text("Fallback", "คำตอบสำรอง");
  };

  const handleAgentChange = (agentId: number) => {
    setSelectedAgentId(agentId);
    setMessages([]);
    setFaqSuggestions([]);
    setInputMessage("");
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const userMessage = inputMessage.trim();
    if (!userMessage || !selectedAgentId || isSending) return;

    setInputMessage("");
    setError(null);
    setMessages((previous) => [...previous, {
      id: `${Date.now()}-user`,
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    }]);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId: selectedAgentId, message: userMessage }),
      });
      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : {};
      if (!response.ok) throw new Error(data.error || text("The agent could not answer right now.", "เอเจนต์ยังไม่สามารถตอบได้ในขณะนี้"));

      setMessages((previous) => [...previous, {
        id: `${Date.now()}-agent`,
        text: data.reply,
        sender: "agent",
        source: data.source,
        timestamp: new Date(),
      }]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : text("The agent could not answer right now.", "เอเจนต์ยังไม่สามารถตอบได้ในขณะนี้"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-950 dark:text-white">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="app-page-header relative mb-6 overflow-hidden">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">{text("FAQ answer verification", "ตรวจสอบคำตอบจาก FAQ")}</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{text("Agent Chat Test", "ทดสอบแชทกับเอเจนต์")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                {text("Choose an agent, ask a real customer question, and confirm whether the answer came from its published FAQ or AI.", "เลือกเอเจนต์ ถามคำถามของลูกค้าจริง และตรวจสอบว่าคำตอบมาจาก FAQ ที่เผยแพร่แล้วหรือ AI")}
              </p>
            </div>
            {messages.length > 0 && (
              <button type="button" onClick={() => { setMessages([]); setError(null); }} className="app-button-outline shrink-0">
                {text("Clear chat", "ล้างแชท")}
              </button>
            )}
          </div>
        </section>

        {isLoadingAgents ? (
          <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]" aria-label={text("Loading chat test", "กำลังโหลดหน้าทดสอบแชท")}>
            <div className="app-card h-96 animate-pulse bg-slate-100/70 dark:bg-white/[0.04]" />
            <div className="app-card h-[38rem] animate-pulse bg-slate-100/70 dark:bg-white/[0.04]" />
          </div>
        ) : agents.length === 0 ? (
          <section className="app-card flex min-h-96 flex-col items-center justify-center p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><AppIcon name="agents" className="h-7 w-7" /></span>
            <h2 className="mt-5 text-xl font-semibold">{text("Create an agent before testing", "สร้างเอเจนต์ก่อนเริ่มทดสอบ")}</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{text("Your test chat uses the selected agent's business prompt and published FAQs.", "แชททดสอบจะใช้คำสั่งธุรกิจและ FAQ ที่เผยแพร่แล้วของเอเจนต์ที่เลือก")}</p>
            <Link href="/dashboard/bots/new" className="app-button-primary mt-6"><AppIcon name="plus" className="h-4 w-4" />{text("Create Agent", "สร้างเอเจนต์")}</Link>
          </section>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
            <aside className="space-y-5 lg:sticky lg:top-24">
              <section className="app-card p-5">
                <label htmlFor="chat-test-agent" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{text("Agent to test", "เอเจนต์ที่ต้องการทดสอบ")}</label>
                <select
                  id="chat-test-agent"
                  value={selectedAgentId ?? ""}
                  onChange={(event) => handleAgentChange(Number(event.target.value))}
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                >
                  {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.bot_name}</option>)}
                </select>

                {selectedAgent && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.035]">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{selectedAgent.business_name}</p>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                      <span className={`rounded-full px-2 py-1 font-semibold ${selectedAgent.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"}`}>{selectedAgent.status === "active" ? text("Active", "พร้อมใช้งาน") : text("Suspended", "ระงับการใช้งาน")}</span>
                      <span className="text-slate-500">{selectedAgent.credit_balance.toLocaleString()} {text("credits", "เครดิต")}</span>
                    </div>
                  </div>
                )}
                <p className="mt-3 text-xs leading-5 text-slate-500">{text("Test messages use the same answer runtime as deployed channels but do not consume agent credits.", "ข้อความทดสอบใช้ระบบตอบคำถามเดียวกับช่องทางที่เปิดใช้งาน แต่ไม่ตัดเครดิตของเอเจนต์")}</p>
              </section>

              <section className="app-card p-5">
                <div className="flex items-center gap-2"><AppIcon name="book" className="h-4 w-4 text-blue-600 dark:text-blue-300" /><h3 className="text-sm font-semibold">{text("Try a published FAQ", "ลองถามจาก FAQ ที่เผยแพร่")}</h3></div>
                <div className="mt-4 space-y-2">
                  {isLoadingFaqs ? (
                    [0, 1, 2].map((item) => <div key={item} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.05]" />)
                  ) : faqSuggestions.length > 0 ? (
                    faqSuggestions.map((faq) => (
                      <button key={faq.id} type="button" onClick={() => setInputMessage(faq.question)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-medium leading-5 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:text-slate-300 dark:hover:border-blue-400/30 dark:hover:bg-blue-400/10 dark:hover:text-blue-300">
                        {faq.question}
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-white/10">
                      <p className="text-xs leading-5 text-slate-500">{text("No published FAQ is available for this agent.", "เอเจนต์นี้ยังไม่มี FAQ ที่เผยแพร่")}</p>
                      {selectedAgentId && <Link href={`/dashboard/bots/${selectedAgentId}/faqs`} className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300">{text("Manage FAQs", "จัดการ FAQ")}</Link>}
                    </div>
                  )}
                </div>
              </section>

              <section className="app-card p-5">
                <h3 className="text-sm font-semibold">{text("Answer source", "แหล่งที่มาของคำตอบ")}</h3>
                <div className="mt-4 space-y-3 text-xs text-slate-500">
                  {(["mysql_faq", "ai", "fallback"] as AnswerSource[]).map((source) => (
                    <div key={source} className="flex items-center gap-2"><span className={`rounded-full border px-2 py-1 font-semibold ${sourceStyles(source)}`}>{sourceLabel(source)}</span></div>
                  ))}
                </div>
              </section>
            </aside>

            <section className="app-card flex min-h-[38rem] flex-col overflow-hidden" aria-label={text("Agent test conversation", "บทสนทนาทดสอบเอเจนต์")}>
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-white/10 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-violet-100 font-bold text-blue-700 dark:from-blue-400/15 dark:to-violet-400/15 dark:text-blue-300">{selectedAgent?.bot_name.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0"><h2 className="truncate text-sm font-semibold">{selectedAgent?.bot_name}</h2><p className="text-xs text-slate-500">{text("Test environment", "สภาพแวดล้อมทดสอบ")}</p></div>
                </div>
                <span className="flex items-center gap-2 text-xs font-medium text-slate-500"><span className={`h-2 w-2 rounded-full ${selectedAgent?.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />{selectedAgent?.status === "active" ? text("Ready", "พร้อม") : text("Unavailable", "ไม่พร้อมใช้งาน")}</span>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/50 p-5 dark:bg-slate-950/20 sm:p-6" aria-live="polite">
                {messages.length === 0 ? (
                  <div className="flex min-h-[25rem] flex-col items-center justify-center text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300"><AppIcon name="sparkles" className="h-7 w-7" /></span>
                    <h3 className="mt-5 text-lg font-semibold">{text("Ask your agent a question", "ลองถามคำถามกับเอเจนต์")}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{text("Use a suggested FAQ or type any customer question. The answer badge will show how it was generated.", "เลือกคำถาม FAQ ที่แนะนำหรือพิมพ์คำถามของลูกค้า ป้ายใต้คำตอบจะแสดงวิธีที่ใช้สร้างคำตอบ")}</p>
                  </div>
                ) : messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[78%] ${message.sender === "user" ? "rounded-br-md bg-blue-600 text-white shadow-sm shadow-blue-600/15" : "rounded-bl-md border border-slate-200 bg-white text-slate-800 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100"}`}>
                      <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                      <div className={`mt-2 flex items-center gap-2 text-[10px] ${message.sender === "user" ? "justify-end text-blue-100" : "text-slate-400"}`}>
                        {message.source && <span className={`rounded-full border px-2 py-0.5 font-semibold ${sourceStyles(message.source)}`}>{sourceLabel(message.source)}</span>}
                        <time>{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                      </div>
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/[0.06]" aria-label={text("Agent is answering", "เอเจนต์กำลังตอบ")}>
                      {[0, 1, 2].map((item) => <span key={item} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${item * 140}ms` }} />)}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.025] sm:p-5">
                {error && <div role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">{error}</div>}
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <label htmlFor="chat-test-message" className="sr-only">{text("Question for the agent", "คำถามสำหรับเอเจนต์")}</label>
                  <input
                    id="chat-test-message"
                    type="text"
                    value={inputMessage}
                    onChange={(event) => setInputMessage(event.target.value)}
                    placeholder={text("Ask about products, prices, delivery…", "ถามเกี่ยวกับสินค้า ราคา การจัดส่ง…")}
                    maxLength={2000}
                    disabled={isSending || selectedAgent?.status !== "active"}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                  />
                  <button type="submit" disabled={isSending || !inputMessage.trim() || selectedAgent?.status !== "active"} className="app-button-primary shrink-0 px-4 sm:px-5">
                    <span className="hidden sm:inline">{isSending ? text("Sending…", "กำลังส่ง…") : text("Send", "ส่ง")}</span><AppIcon name="arrow" className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
