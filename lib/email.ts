import { Resend } from "resend";

type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

const resendApiKey = process.env.RESEND_API_KEY || "";
const resendFrom = process.env.RESEND_FROM_EMAIL || "contact@line.rattanan.dev";

function getResendClient() {
  if (!resendApiKey) return null;
  return new Resend(resendApiKey);
}

export async function sendMail(message: MailMessage) {
  const client = getResendClient();
  if (!client) {
    console.log(`[mail:${message.to}] ${message.subject}\n${message.text}`);
    return;
  }

  try {
    const result = await client.emails.send({
      from: resendFrom,
      to: [message.to],
      subject: message.subject,
      text: message.text,
    });
    console.log(`[mail:${message.to}] sent via resend`, result?.data?.id || "");
  } catch (error) {
    console.error(`[mail:${message.to}] resend delivery failed`, error);
    throw error;
  }
}
