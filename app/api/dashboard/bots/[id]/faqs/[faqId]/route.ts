import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getBotById } from "@/lib/bots";
import { deleteFAQ, getFAQById, updateFAQ } from "@/lib/faq";

export async function PUT(req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/faqs/[faqId]">) {
  const userId = await getSessionUserId();
  const { id, faqId } = await context.params;
  const bot = await getBotById(Number(id));
  if (!userId || !bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const faq = await updateFAQ(
    Number(faqId),
    body.question ? String(body.question).trim() : undefined,
    body.answer ? String(body.answer).trim() : undefined,
    typeof body.isActive === "boolean" ? body.isActive : undefined
  );
  return NextResponse.json(faq);
}

export async function DELETE(_req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/faqs/[faqId]">) {
  const userId = await getSessionUserId();
  const { id, faqId } = await context.params;
  const bot = await getBotById(Number(id));
  if (!userId || !bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteFAQ(Number(faqId));
  return NextResponse.json({ ok: true });
}

export async function GET(_req: NextRequest, context: RouteContext<"/api/dashboard/bots/[id]/faqs/[faqId]">) {
  const userId = await getSessionUserId();
  const { id, faqId } = await context.params;
  const bot = await getBotById(Number(id));
  if (!userId || !bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const faq = await getFAQById(Number(faqId));
  return NextResponse.json(faq);
}
