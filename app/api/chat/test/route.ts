import { NextRequest, NextResponse } from "next/server";
import { generateAnswer } from "@/lib/bot/answer";

/**
 * POST /api/chat/test
 * Test endpoint for bot answer generation
 * 
 * Request body:
 * {
 *   "message": "user question"
 * }
 * 
 * Response:
 * {
 *   "reply": "bot answer",
 *   "source": "mysql_faq" | "ai" | "fallback"
 * }
 */
export async function POST(req: NextRequest) {
  // Check if chat test is enabled
  const chatTestEnabled = process.env.CHAT_TEST_ENABLED === "true";

  if (!chatTestEnabled) {
    return NextResponse.json(
      { error: "Chat test is disabled. Set CHAT_TEST_ENABLED=true to enable." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { message } = body;

    // Validate request body
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid request body. Expected { message: string }" },
        { status: 400 }
      );
    }

    // Generate answer using shared service with userId for chat logging
    const { reply, source } = await generateAnswer(message, { userId: "test-user" });

    return NextResponse.json({
      reply,
      source,
    });
  } catch (error) {
    console.error("Chat test API Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}