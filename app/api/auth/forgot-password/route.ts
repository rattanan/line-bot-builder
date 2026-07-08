import { NextRequest, NextResponse } from "next/server";
import { createResetToken, findUserByEmail } from "@/lib/users";
import { sendMail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  const user = await findUserByEmail(String(email));
  if (user) {
    const token = await createResetToken(user.id);
    const resetUrl = new URL("/reset-password", req.url);
    resetUrl.searchParams.set("token", token);
    await sendMail({ to: user.email, subject: "Reset your password", text: resetUrl.toString() });
  }

  return NextResponse.json({ ok: true });
}
