import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type StoredKnowledgeFile = {
  url: string;
  type: string;
  originalName: string;
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export async function storeKnowledgeWizardImage(file: File, botId: number, wizardId: number): Promise<StoredKnowledgeFile> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Invalid file type");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("File too large");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "knowledge-wizard", String(botId), String(wizardId));
  await fs.mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${randomUUID()}.${ext}`;
  const filePath = path.join(dir, name);
  await fs.writeFile(filePath, bytes);

  return {
    url: `/uploads/knowledge-wizard/${botId}/${wizardId}/${name}`,
    type: file.type,
    originalName: file.name,
  };
}
