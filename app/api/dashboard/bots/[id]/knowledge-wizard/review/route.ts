import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getBotById } from "@/lib/bots";
import {
  addKnowledgeCandidates,
  approveKnowledgeCandidate,
  deleteKnowledgeCandidate,
  listKnowledgeCandidatesByWizard,
  mergeKnowledgeCandidates,
  updateKnowledgeCandidate,
} from "@/lib/bot-knowledge-wizard";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const bot = await getBotById(Number(id));
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const wizardId = Number(req.nextUrl.searchParams.get("wizardId") || 0);
  const candidates = wizardId ? await listKnowledgeCandidatesByWizard(wizardId, bot.id) : [];
  const mergedCandidates = wizardId ? await mergeKnowledgeCandidates(wizardId, bot.id) : [];
  return NextResponse.json({ candidates: mergedCandidates, rawCandidates: candidates });
}

export async function POST(req: NextRequest, context: RouteContext) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const bot = await getBotById(Number(id));
  if (!bot || bot.user_id !== userId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (Array.isArray(body.candidates) && body.wizardId) {
    await addKnowledgeCandidates(Number(body.wizardId), bot.id, body.candidates);
    return NextResponse.json({ ok: true }, { status: 201 });
  }
  if (body.approveCandidateId) {
    const faq = await approveKnowledgeCandidate(Number(body.approveCandidateId), bot.id);
    return NextResponse.json({ faq });
  }
  if (body.updateCandidateId) {
    const candidate = await updateKnowledgeCandidate(Number(body.updateCandidateId), bot.id, {
      question: body.question ? String(body.question) : undefined,
      answer: body.answer ? String(body.answer) : undefined,
      category: body.category ? String(body.category) : undefined,
      status:
        body.status === "draft" || body.status === "approved" || body.status === "rejected" || body.status === "merged"
          ? body.status
          : undefined,
    });
    return NextResponse.json({ candidate });
  }
  if (body.deleteCandidateId) {
    await deleteKnowledgeCandidate(Number(body.deleteCandidateId), bot.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}
