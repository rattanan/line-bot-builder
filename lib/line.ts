import { messagingApi } from "@line/bot-sdk";

const client = new messagingApi.MessagingApiClient({
channelAccessToken:
process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

export async function replyMessage(
replyToken: string,
text: string
) {
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
