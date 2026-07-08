import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { generateWizardContent } from "@/lib/bot-wizard";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const storeName = String(body.storeName || "").trim();
  const storeDescription = String(body.storeDescription || "").trim();
  const services = String(body.services || "").trim();
  const openingHours = String(body.openingHours || "").trim();
  const contactChannels = String(body.contactChannels || "").trim();
  const tone = String(body.tone || "").trim();

  if (!storeName || !storeDescription || !services || !openingHours || !contactChannels || !tone) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const result = await generateWizardContent({
    storeName,
    storeDescription,
    services,
    openingHours,
    contactChannels,
    tone,
  });

  return NextResponse.json(result);
}
