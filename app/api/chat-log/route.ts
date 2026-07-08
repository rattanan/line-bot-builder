import { NextResponse, NextRequest } from "next/server";
import { getChatHistory } from "@/lib/chat-log";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const limitParam = searchParams.get("limit");
  const pageParam = searchParams.get("page");
  const sortByParam = searchParams.get("sortBy");
  const sortOrderParam = searchParams.get("sortOrder");
  const limit = limitParam ? Number(limitParam) : 20;
  const page = pageParam ? Number(pageParam) : 1;
  const offset = Math.max(0, (page - 1) * limit);
  const sortBy =
    sortByParam === "user_id" || sortByParam === "answer_source" ? sortByParam : "created_at";
  const sortOrder = sortOrderParam === "asc" ? "asc" : "desc";

  const { rows, total } = await getChatHistory({
    userId: userId || undefined,
    limit,
    offset,
    sortBy,
    sortOrder,
  });

  return NextResponse.json({
    rows,
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    sortBy,
    sortOrder,
  });
}
