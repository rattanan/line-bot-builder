import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { executeQuery, withTransaction } from "./mysql";
import { getSessionUserId } from "./auth";
import { openAICompatibleChat } from "./ai/openai-compatible";
import { hasUserCreditBalanceColumn } from "./users";

export type TopupOrderStatus = "pending" | "uploaded" | "verified" | "rejected" | "manual_review" | "expired";

export type TopupOrder = {
  id: number;
  user_id: number;
  amount: string;
  credit_amount: number;
  status: TopupOrderStatus;
  qr_payload: string;
  slip_image_url: string | null;
  slip_transaction_id: string | null;
  slip_transfer_time: string | null;
  verified_at: string | null;
  rejected_reason: string | null;
  ocr_result: string | null;
  created_at: string;
  expires_at: string;
};

const PROMPTPAY_PHONE = "0818558081";

export const TOPUP_PACKAGES = [
  { amount: 50, creditAmount: 500 },
  { amount: 100, creditAmount: 1200 },
  { amount: 300, creditAmount: 4000 },
];

export function getTopupPackage(amount: number) {
  return TOPUP_PACKAGES.find((pkg) => pkg.amount === amount) ?? null;
}

export function buildPromptPayPayload(amount: number) {
  return `00020101021229370016A00000067701011101130066${PROMPTPAY_PHONE}5303764540${amount.toFixed(2)}5802TH6304`;
}

export async function createTopupOrder(input: { userId: number; amount: number }) {
  const pkg = getTopupPackage(input.amount);
  if (!pkg) throw new Error("Invalid topup package");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const qrPayload = buildPromptPayPayload(pkg.amount);
  const result = await executeQuery(
    `INSERT INTO topup_orders (user_id, amount, credit_amount, status, qr_payload, expires_at)
     VALUES (?, ?, ?, 'pending', ?, ?)`,
    [input.userId, pkg.amount, pkg.creditAmount, qrPayload, expiresAt]
  );
  return result.insertId ? getTopupOrderById(result.insertId, input.userId) : null;
}

export async function getTopupOrderById(orderId: number, userId?: number) {
  const result = await executeQuery<TopupOrder>(
    `SELECT id, user_id, amount, credit_amount, status, qr_payload, slip_image_url, slip_transaction_id, slip_transfer_time, verified_at, rejected_reason, ocr_result, created_at, expires_at
     FROM topup_orders
     WHERE id = ? ${userId ? "AND user_id = ?" : ""}
     LIMIT 1`,
    userId ? [orderId, userId] : [orderId]
  );
  return result.rows[0] ?? null;
}

export async function listTopupOrders(userId: number) {
  const result = await executeQuery<TopupOrder>(
    `SELECT id, user_id, amount, credit_amount, status, qr_payload, slip_image_url, slip_transaction_id, slip_transfer_time, verified_at, rejected_reason, ocr_result, created_at, expires_at
     FROM topup_orders
     WHERE user_id = ?
     ORDER BY id DESC`,
    [userId]
  );
  return result.rows;
}

export async function listTopupReviews() {
  const result = await executeQuery<TopupOrder & { email: string; full_name: string }>(
    `SELECT o.*, u.email, u.full_name
     FROM topup_orders o
     INNER JOIN users u ON u.id = o.user_id
     WHERE o.status IN ('pending', 'uploaded', 'manual_review')
     ORDER BY o.id DESC`
  );
  return result.rows;
}

async function saveSlipFile(file: File, orderId: number) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Invalid file type");
  if (file.size > 5 * 1024 * 1024) throw new Error("File too large");
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "topup");
  await fs.mkdir(dir, { recursive: true });
  const name = `${orderId}-${Date.now()}-${randomUUID()}.${ext}`;
  const filePath = path.join(dir, name);
  await fs.writeFile(filePath, bytes);
  return `/uploads/topup/${name}`;
}

async function tryExtractOcrText(imageUrl: string) {
  try {
    const { content } = await openAICompatibleChat([
      {
        role: "system",
        content:
          "คุณคือระบบ OCR สำหรับสลิปโอนเงิน ตอบกลับเป็น JSON เท่านั้นในรูปแบบ {\"amount\":number|null,\"receiver_name\":string|null,\"receiver_account\":string|null,\"transaction_id\":string|null,\"transfer_time\":string|null,\"confidence\":\"high\"|\"medium\"|\"low\",\"notes\":string[]}",
      },
      {
        role: "user",
        content: `โปรดอ่านข้อความจากสลิปภาพนี้: ${imageUrl}`,
      },
    ], { temperature: 0, maxTokens: 300 });
    return content;
  } catch (error) {
    return null;
  }
}

export async function uploadTopupSlip(orderId: number, userId: number, file: File) {
  const slipImageUrl = await saveSlipFile(file, orderId);
  const ocrResult = await tryExtractOcrText(slipImageUrl);
  await executeQuery(
    `UPDATE topup_orders
     SET slip_image_url = ?, status = 'uploaded', ocr_result = ?
     WHERE id = ? AND user_id = ? AND status = 'pending'`,
    [slipImageUrl, ocrResult, orderId, userId]
  );
  return getTopupOrderById(orderId, userId);
}

export async function evaluateTopupOrder(orderId: number, actor: { adminEmail?: string } = {}) {
  return withTransaction(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT id, user_id, amount, credit_amount, status, qr_payload, slip_image_url, slip_transaction_id, slip_transfer_time, verified_at, rejected_reason, ocr_result, created_at, expires_at
       FROM topup_orders WHERE id = ? FOR UPDATE`,
      [orderId]
    );
    const order = Array.isArray(rows) ? (rows[0] as TopupOrder | undefined) : undefined;
    if (!order) return null;
    if (order.status === "verified") return order;
    const ocr = order.ocr_result ? (() => { try { return JSON.parse(order.ocr_result ?? "{}"); } catch { return null; } })() : null;
    const now = new Date();
    const expiresAt = new Date(order.expires_at);
    if (expiresAt.getTime() < now.getTime() && order.status === "pending") {
      await connection.execute("UPDATE topup_orders SET status = 'expired' WHERE id = ?", [orderId]);
      return { ...order, status: "expired" as const };
    }
    const amount = Number(order.amount);
    const confidence = ocr?.confidence;
    const hasFullData = ocr?.amount === amount && !!ocr?.transaction_id && !!ocr?.transfer_time && !!ocr?.receiver_name;
    if (!ocr || confidence !== "high" || !hasFullData) {
      await connection.execute("UPDATE topup_orders SET status = 'manual_review' WHERE id = ?", [orderId]);
      return { ...order, status: "manual_review" as const };
    }
    const [dupeRows] = await connection.execute(
      "SELECT id FROM topup_orders WHERE slip_transaction_id = ? AND id <> ? LIMIT 1",
      [String(ocr.transaction_id), orderId]
    );
    if (Array.isArray(dupeRows) && dupeRows.length) {
      await connection.execute("UPDATE topup_orders SET status = 'rejected', rejected_reason = 'transaction_id already used' WHERE id = ?", [orderId]);
      return { ...order, status: "rejected" as const };
    }
    const [userRows] = await connection.execute(
      "SELECT id, credit_balance FROM users WHERE id = ? FOR UPDATE",
      [order.user_id]
    );
    const user = Array.isArray(userRows) ? (userRows[0] as { id: number; credit_balance?: number } | undefined) : undefined;
    if (!user) return null;
    const currentBalance = user.credit_balance ?? 0;
    const nextBalance = currentBalance + order.credit_amount;
    await connection.execute(
      `UPDATE topup_orders
       SET status = 'verified', slip_transaction_id = ?, slip_transfer_time = ?, verified_at = NOW()
       WHERE id = ?`,
      [String(ocr.transaction_id), new Date(String(ocr.transfer_time)), orderId]
    );
    if (await hasUserCreditBalanceColumn()) {
      await connection.execute("UPDATE users SET credit_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [nextBalance, order.user_id]);
    }
    await connection.execute(
      `INSERT INTO credit_transactions (user_id, type, amount, balance_before, balance_after, ref_type, ref_id, reason, admin_email)
       VALUES (?, 'topup', ?, ?, ?, 'topup_order', ?, ?, ?)`,
      [order.user_id, order.credit_amount, currentBalance, nextBalance, order.id, "PromptPay topup verified", actor.adminEmail ?? null]
    );
    return { ...order, status: "verified" as const };
  });
}

export async function adminReviewTopup(orderId: number, approve: boolean, reason?: string) {
  if (approve) {
    return evaluateTopupOrder(orderId, { adminEmail: "admin-review" });
  }
  await executeQuery("UPDATE topup_orders SET status = 'rejected', rejected_reason = ? WHERE id = ?", [reason || "Rejected by admin", orderId]);
  return getTopupOrderById(orderId);
}

export async function currentUserIdOrThrow() {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}
