import { messagingApi } from "@line/bot-sdk";

export function createLineClient(channelAccessToken: string) {
  return new messagingApi.MessagingApiClient({
    channelAccessToken,
  });
}

export async function replyMessage(
  channelAccessToken: string,
  replyToken: string,
  text: string
) {
  if (process.env.NODE_ENV !== "production" && channelAccessToken.startsWith("token-e2e-")) {
    console.log(`[LINE Mock Reply] ${replyToken}: ${text}`);
    return;
  }

  const client = createLineClient(channelAccessToken);
  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: "text",
        text,
      },
    ],
  });
}
