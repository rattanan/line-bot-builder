import "server-only";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const MAX_ICON_SIZE = 2 * 1024 * 1024;
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const ALLOWED_FILE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export async function storeWidgetIcon(file: File, botId: number): Promise<string> {
  const declaredMime = file.type.toLowerCase();
  const originalExtension = path.extname(file.name).toLowerCase();
  if (!MIME_TO_EXTENSION[declaredMime] || !ALLOWED_FILE_EXTENSIONS.has(originalExtension)) {
    throw new Error("รองรับเฉพาะไฟล์ JPG, JPEG, PNG และ WebP");
  }
  const extensionMime = originalExtension === ".png" ? "image/png" : originalExtension === ".webp" ? "image/webp" : "image/jpeg";
  if (extensionMime !== declaredMime) throw new Error("นามสกุลไฟล์ไม่ตรงกับ MIME Type");
  if (!file.size || file.size > MAX_ICON_SIZE) throw new Error("ไฟล์ต้องมีขนาดไม่เกิน 2 MB");

  const bytes = Buffer.from(await file.arrayBuffer());
  const detectedMime = detectImageMime(bytes);
  if (!detectedMime || detectedMime !== declaredMime) throw new Error("ชนิดไฟล์ไม่ตรงกับเนื้อหาของไฟล์");

  const directory = path.join(process.cwd(), "public", "uploads", "widget-icons", String(botId));
  await fs.mkdir(directory, { recursive: true });
  const filename = `${Date.now()}-${randomUUID()}.${MIME_TO_EXTENSION[detectedMime]}`;
  await fs.writeFile(path.join(directory, filename), bytes, { flag: "wx" });
  return `/uploads/widget-icons/${botId}/${filename}`;
}

export async function removeWidgetIcon(url: string | null | undefined, botId: number): Promise<void> {
  if (!url) return;
  const expectedPrefix = `/uploads/widget-icons/${botId}/`;
  let pathname: string;
  try {
    pathname = new URL(url, "http://local.invalid").pathname;
  } catch {
    return;
  }
  if (!pathname.startsWith(expectedPrefix)) return;
  const filename = path.basename(pathname);
  if (!/^[0-9]+-[a-f0-9-]+\.(jpg|png|webp)$/i.test(filename)) return;
  const filePath = path.join(process.cwd(), "public", "uploads", "widget-icons", String(botId), filename);
  await fs.unlink(filePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
}

function detectImageMime(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "image/png";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  return null;
}
