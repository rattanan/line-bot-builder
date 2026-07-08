import { NextResponse, NextRequest } from "next/server";
import { getFAQById, updateFAQ, deleteFAQ } from "@/lib/faq";

function parseId(params: { id: string }) {
  const id = Number(params.id);
  return isNaN(id) ? null : id;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = parseId({ id });
  if (parsedId === null) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const faq = await getFAQById(parsedId);
  if (!faq) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(faq);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = parseId({ id });
  if (parsedId === null) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const { question, answer } = await req.json();
  const updated = await updateFAQ(parsedId, question, answer);
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsedId = parseId({ id });
  if (parsedId === null) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const success = await deleteFAQ(parsedId);
  return NextResponse.json({ success });
}
