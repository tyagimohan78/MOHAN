import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { config } from "./config";

// Allowed upload types, verified by magic bytes (not just the browser-supplied MIME type).
const SIGNATURES: { mime: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { mime: "image/png", ext: "png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/webp", ext: "webp", test: (b) => b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP" },
  { mime: "application/pdf", ext: "pdf", test: (b) => b.subarray(0, 5).toString() === "%PDF-" },
];
export const IMAGE_MIMES = ["image/png", "image/jpeg", "image/webp"];
export const ATTACHMENT_MIMES = [...IMAGE_MIMES, "application/pdf"];

export function detectType(buf: Buffer) {
  return SIGNATURES.find((s) => s.test(buf)) || null;
}

export type StoredFile = { key: string; mime: string; size: number; fileName: string };

export async function validateAndStore(file: File, prefix: "tickets" | "products", allowed: string[]): Promise<StoredFile | { error: string }> {
  if (file.size === 0) return { error: "The selected file is empty." };
  if (file.size > config.maxUploadBytes) return { error: `Files must be ${Math.round(config.maxUploadBytes / 1048576)} MB or smaller.` };
  const buf = Buffer.from(await file.arrayBuffer());
  const type = detectType(buf);
  if (!type || !allowed.includes(type.mime)) return { error: "Only PNG, JPG, WebP images or PDF documents are allowed." };
  const key = `${prefix}/${randomBytes(16).toString("hex")}.${type.ext}`;
  const fileName = path.basename(file.name).replace(/[^\w.\- ]+/g, "_").slice(0, 120) || `file.${type.ext}`;
  await putObject(key, buf, type.mime);
  return { key, mime: type.mime, size: buf.length, fileName };
}

let s3: S3Client | null = null;
function client() {
  if (!s3) {
    s3 = new S3Client({
      region: config.storage.s3Region,
      endpoint: config.storage.s3Endpoint,
      credentials:
        config.storage.s3AccessKeyId && config.storage.s3SecretAccessKey
          ? { accessKeyId: config.storage.s3AccessKeyId, secretAccessKey: config.storage.s3SecretAccessKey }
          : undefined,
    });
  }
  return s3;
}

function localPath(key: string) {
  if (!/^(tickets|products)\/[a-f0-9]{32}\.(png|jpg|webp|pdf)$/.test(key)) throw new Error("Invalid storage key");
  return path.join(path.resolve(config.storage.localDir), key);
}

async function putObject(key: string, body: Buffer, mime: string) {
  if (config.storage.driver === "s3") {
    await client().send(new PutObjectCommand({ Bucket: config.storage.s3Bucket, Key: key, Body: body, ContentType: mime }));
    return;
  }
  const p = localPath(key);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, body, { mode: 0o640 });
}

export async function getObject(key: string): Promise<Buffer | null> {
  try {
    if (config.storage.driver === "s3") {
      const res = await client().send(new GetObjectCommand({ Bucket: config.storage.s3Bucket, Key: key }));
      if (!res.Body) return null;
      return Buffer.from(await res.Body.transformToByteArray());
    }
    return await fs.readFile(localPath(key));
  } catch {
    return null;
  }
}
