// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { openDb } from "@/lib/db";

function getClientIp(req: Request) {
  // prefer forwarded header if behind proxy; fallback to 'unknown'
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").toString();
  const ua = req.headers.get("user-agent") || "";

  const db = await openDb();
  const sql = `SELECT id, username FROM users WHERE username LIKE '%${q}%' LIMIT 20;`; // intentionally vulnerable

  try {
    // run the vulnerable query
    const rows = await db.all(sql);

    // log the raw query for your honeypot dashboard
    try {
      const ip = getClientIp(req);
      const insertSql = `INSERT INTO attacks (q, sql, ip, user_agent) VALUES (?, ?, ?, ?);`;
      await db.run(insertSql, q, sql, ip, ua);
    } catch (logErr) {
      // ignore logging errors so the endpoint still responds
      console.error("Failed to log attack:", logErr);
    }

    return NextResponse.json({ q, sql, rows });
  } catch (err: any) {
    return NextResponse.json({ error: String(err), sql }, { status: 500 });
  } finally {
    await db.close();
  }
}
