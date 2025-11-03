// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "app.db");

async function openDb() {
  return open({ filename: DB_PATH, driver: sqlite3.Database });
}

function isRawWhere(v: string) {
  return typeof v === "string" && v.startsWith("RAW_WHERE:");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const usernameInput = (body.username ?? "").toString();
    const passwordInput = (body.password ?? "").toString();

    const db = await openDb();

    // If username or password starts with RAW_WHERE:, insert the remainder directly
    // as the WHERE clause (exactly as provided). This is intentionally insecure:
    // only for honeypot/demo use.
    let whereClause = "";

    if (isRawWhere(usernameInput)) {
      // Use the remainder exactly as the WHERE clause
      whereClause = usernameInput.slice("RAW_WHERE:".length);
    } else {
      // normal username comparison (quoted)
      whereClause = `username = '${usernameInput}'`;

      if (isRawWhere(passwordInput)) {
        // append raw password expression directly (wrap it in parentheses to be safe)
        whereClause += ` AND (${passwordInput.slice("RAW_WHERE:".length)})`;
      } else {
        whereClause += ` AND password = '${passwordInput}'`;
      }
    }

    // Trim whitespace and ensure we have something sensible
    whereClause = whereClause.trim();
    if (!whereClause) whereClause = "1=0"; // no match if nothing provided

    const sql = `
      SELECT id, username
      FROM users
      WHERE ${whereClause}
      LIMIT 1;
    `;

    try {
      const row = await db.get(sql);
      await db.close();

      if (row) {
        return NextResponse.json({
          success: true,
          user: row,
          sql,
          message: "Login successful!",
        });
      } else {
        return NextResponse.json({
          success: false,
          sql,
          message: "Invalid credentials!",
        });
      }
    } catch (err: any) {
      await db.close();
      return NextResponse.json({ error: String(err), sql }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "invalid json", detail: String(err) }, { status: 400 });
  }
}
