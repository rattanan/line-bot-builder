import { NextRequest, NextResponse } from "next/server";
import { createVerificationToken, createUser, ensureSeedAdminUser } from "@/lib/users";
import { sendMail } from "@/lib/email";

export async function POST(req: NextRequest) {
  await ensureSeedAdminUser();
  const { email, fullName, password } = await req.json();
  if (!email || !fullName || !password) {
    return NextResponse.json({ error: "email, fullName and password are required" }, { status: 400 });
  }

  const user = await createUser({ email: String(email), fullName: String(fullName), password: String(password) });
  if (!user) {
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }

  const token = await createVerificationToken(user.id);
  const verifyUrl = new URL("/api/auth/verify-email", req.url);
  verifyUrl.searchParams.set("token", token);
  await sendMail({
    to: user.email,
    subject: "Verify your email",
    text: `Click to verify your email: ${verifyUrl.toString()}`,
  });

  return NextResponse.json({ ok: true });
}
