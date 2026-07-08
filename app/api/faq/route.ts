import { NextResponse, NextRequest } from "next/server";
import { getFAQData, addFAQ } from "@/lib/faq";

// GET /api/faq – list all FAQs
export async function GET(_req: NextRequest) {
  const data = await getFAQData();
  return NextResponse.json(data);
}

// POST /api/faq – create a new FAQ
export async function POST(req: NextRequest) {
  try {
    const { botId, question, answer } = await req.json();
    if (!question || !answer) {
      return NextResponse.json({ error: "question and answer required" }, { status: 400 });
    }
    const newFAQ = await addFAQ(Number(botId || 0), question, answer);
    if (!newFAQ) {
      return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 });
    }
    return NextResponse.json(newFAQ, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
