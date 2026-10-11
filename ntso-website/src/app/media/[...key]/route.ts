import { getObject } from "@/lib/server/storage";

// Public delivery of admin-uploaded product images only. Ticket attachments are NOT served here.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const path = key.join("/");
  if (!/^products\/[a-f0-9]{32}\.(png|jpg|webp)$/.test(path)) return new Response("Not found", { status: 404 });
  const body = await getObject(path);
  if (!body) return new Response("Not found", { status: 404 });
  const ext = path.split(".").pop();
  const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'" },
  });
}
