import { replyMessage } from "@/lib/line";
import { generateAnswer } from "@/lib/bot/answer";

const LINE_TEXT_LIMIT = 5000;

type LineWebhookEvent = {
  type: string;
  replyToken: string;
  message?: {
    type: string;
    text?: string;
  };
  source?: {
    type: string;
    userId?: string;
  };
};

function toLineText(text: string) {
  const trimmed = text.trim();

  if (trimmed.length <= LINE_TEXT_LIMIT) {
    return trimmed;
  }

  return `${trimmed.slice(0, LINE_TEXT_LIMIT - 24)}\n\n(คำตอบยาวเกินไปเลยตัดจบไว้ตรงนี้)`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const events: LineWebhookEvent[] = body.events || [];

    if (!events.length) {
      return Response.json({ ok: true });
    }

    await Promise.all(
      events.map(async (event) => {
        if (event.type !== "message") {
          return;
        }

        if (event.message?.type !== "text" || !event.message.text) {
          return;
        }

        const question = event.message.text;
        const userId = event.source?.userId;

        const { reply, source } = await generateAnswer(question, { userId });

        // Log the source for debugging
        console.log(`[LINE Webhook] Question: "${question}" -> Source: ${source}`);

        const replyText = toLineText(reply);

        await replyMessage(event.replyToken, replyText);
      })
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      success: false,
    });
  }
}
