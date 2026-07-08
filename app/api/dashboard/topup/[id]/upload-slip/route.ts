import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { uploadTopupSlip, evaluateTopupOrder } from "@/lib/topup";

export async function POST(req: NextRequest, context: RouteContext<"/api/dashboard/topup/[id]/upload-slip">) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orderId = Number((await context.params).id);
  const form = await req.formData();
  const file = form.get("slip");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Slip image is required" }, { status: 400 });
  }
  const order = await uploadTopupSlip(orderId, userId, file);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const evaluated = await evaluateTopupOrder(orderId);
  return NextResponse.json({
    order: evaluated,
    message:
      evaluated?.status === "verified"
        ? `เติมเครดิตสำเร็จ ได้รับ ${evaluated.credit_amount} messages`
        : "ระบบได้รับสลิปแล้ว อยู่ระหว่างตรวจสอบ",
  });
}
