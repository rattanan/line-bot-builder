import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createVerificationToken } from "@/lib/users";
import { sendMail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const user = await findUserByEmail(String(email));
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  if (user.email_verified_at) {
    return NextResponse.json({ ok: true, message: "already verified" });
  }

  const token = await createVerificationToken(user.id);
  const verifyUrl = new URL("/api/auth/verify-email", req.url);
  verifyUrl.searchParams.set("token", token);
  console.log(`[auth:resend-verification] verification link for ${user.email}: ${verifyUrl.toString()}`);

  await sendMail({
    to: user.email,
    subject: "Verify your email",
    text: `Click to verify your email: ${verifyUrl.toString()}`,
  });

  return NextResponse.json({ ok: true });
}
