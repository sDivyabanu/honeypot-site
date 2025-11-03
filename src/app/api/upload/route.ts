// src/app/api/upload/route.ts
import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const runtime = "nodejs"; // need Node APIs available

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "uploads.log"); // newline-delimited JSON

// Helper: create IncomingMessage-like stream from Web Request and attach headers/method
async function requestToNodeIncomingMessage(req: Request) {
  const arrayBuffer = await req.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const headers: Record<string, string> = {};
  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  headers["content-length"] = String(buffer.length);

  // attach the props formidable expects
  // @ts-ignore
  stream.headers = headers;
  // @ts-ignore
  stream.method = req.method ?? "POST";
  // @ts-ignore
  stream.url = "/api/upload";

  return stream as any;
}

// Ensure folders exist
function ensureDirs() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function appendLog(obj: Record<string, any>) {
  try {
    const line = JSON.stringify(obj) + "\n";
    fs.appendFileSync(LOG_FILE, line, { encoding: "utf-8" });
  } catch (e) {
    console.error("Failed to write log:", e);
  }
}

export async function POST(req: Request) {
  try {
    ensureDirs();

    const nodeReq = await requestToNodeIncomingMessage(req);

    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      // limits: { fileSize: 20 * 1024 * 1024 }, // optional
    });

    const parsed = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(nodeReq, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const fileEntry = (parsed.files as any).file;
    if (!fileEntry) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const file = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;
    const tmpPath = (file as any).filepath || (file as any).path;
    if (!tmpPath) {
      console.error("Uploaded file missing temp path:", file);
      return NextResponse.json({ error: "Upload failed (no temp path)" }, { status: 500 });
    }

    const finalName = file.originalFilename || path.basename(tmpPath);
    const dest = path.join(UPLOAD_DIR, finalName);

    // move, with copy fallback
    try {
      fs.renameSync(tmpPath, dest);
    } catch (renameErr) {
      console.warn("Rename failed, trying copy fallback:", renameErr);
      try {
        fs.copyFileSync(tmpPath, dest);
        fs.unlinkSync(tmpPath);
      } catch (copyErr) {
        console.error("File save fallback failed:", copyErr);
        return NextResponse.json({ error: "Failed to save uploaded file" }, { status: 500 });
      }
    }

    // Collect metadata for log
    const forwardedFor = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
    const ip = forwardedFor || req.headers.get("x-real-ip") || "unknown";
    const ua = req.headers.get("user-agent") || "unknown";
    const stats = fs.statSync(dest);
    const size = stats.size;
    const ts = new Date().toISOString();

    const logEntry = {
      timestamp: ts,
      filename: finalName,
      savedAt: `/uploads/${finalName}`,
      size,
      ip,
      userAgent: ua,
    };

    appendLog(logEntry);

    return NextResponse.json({
      ok: true,
      filename: finalName,
      savedAt: `/uploads/${finalName}`,
    });
  } catch (err) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET: list uploads and parsed logs
export async function GET() {
  try {
    ensureDirs();

    // list files in uploads
    const files = fs.existsSync(UPLOAD_DIR)
      ? fs.readdirSync(UPLOAD_DIR).map((name) => {
          const p = path.join(UPLOAD_DIR, name);
          const stat = fs.statSync(p);
          return {
            filename: name,
            savedAt: `/uploads/${name}`,
            size: stat.size,
            mtime: stat.mtime.toISOString(),
          };
        })
      : [];

    // read logs (newline-delimited JSON)
    let logs: any[] = [];
    if (fs.existsSync(LOG_FILE)) {
      const raw = fs.readFileSync(LOG_FILE, "utf-8");
      logs = raw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          try {
            return JSON.parse(l);
          } catch {
            return { raw: l };
          }
        })
        .reverse(); // newest first
    }

    return NextResponse.json({ ok: true, files, logs });
  } catch (err) {
    console.error("GET /api/upload error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
