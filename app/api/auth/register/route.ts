import { NextRequest, NextResponse } from "next/server";
import { createVerificationToken, createUser } from "@/lib/users";
import { sendMail } from "@/lib/email";
import { getAppUrl } from "@/lib/app-url";

export async function POST(req: NextRequest) {
  const { email, fullName, password } = await req.json();
  if (!email || !fullName || !password) {
    return NextResponse.json({ error: "email, fullName and password are required" }, { status: 400 });
  }

  let user;
  try {
    user = await createUser({ email: String(email), fullName: String(fullName), password: String(password) });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === "EMAIL_EXISTS") {
      return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
    }
    throw error;
  }
  if (!user) {
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }

  const token = await createVerificationToken(user.id);
  const verifyUrl = getAppUrl(req, "/api/auth/verify-email");
  verifyUrl.searchParams.set("token", token);
  await sendMail({
    to: user.email,
    subject: "Verify your email",
    text: `Click to verify your email: ${verifyUrl.toString()}`,
  });

  return NextResponse.json({ ok: true });
}
