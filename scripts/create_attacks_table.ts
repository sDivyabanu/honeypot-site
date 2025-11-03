// scripts/create_attacks_table.ts
import path from "path";
import { openDb } from "../src/lib/db"; // <- relative path, adjust if your db file is elsewhere

async function main() {
  const db = await openDb();
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS attacks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        q TEXT,
        sql TEXT,
        ip TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ attacks table created!");
  } catch (err) {
    console.error("Failed to create attacks table:", err);
    process.exit(1);
  } finally {
    await db.close();
  }
}

main();
