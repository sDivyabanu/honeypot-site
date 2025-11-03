// src/app/api/comment/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { openDb as openDbWrapper } from "@/lib/db"; // uses your wrapper that returns { db, run, all, get, close }

export async function GET() {
  const dbWrap = await openDbWrapper();
  try {
    const rows = await dbWrap.all(`SELECT id, author, body, ts, payload_type FROM comments ORDER BY ts DESC`);
    await dbWrap.close();
    return NextResponse.json({ ok: true, comments: rows });
  } catch (err) {
    console.error("GET /api/comment error", err);
    try { await dbWrap.close(); } catch {}
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let payload: any;
  try {
    payload = await req.json();
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const author = String(payload.author ?? "anon").slice(0, 100);
  const body = String(payload.body ?? "").slice(0, 5000);
  const ts = Math.floor(Date.now() / 1000);
  const payload_type = /<script[\s>]/i.test(body) ? "xss" : "text";

  const dbWrap = await openDbWrapper();
  try {
    await dbWrap.run(
      `INSERT INTO comments (author, body, ts, payload_type) VALUES (?, ?, ?, ?)`,
      [author, body, ts, payload_type]
    );
    await dbWrap.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/comment error", err);
    try { await dbWrap.close(); } catch {}
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
