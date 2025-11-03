// src/lib/db.ts
import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "app.db");

// This wrapper returns helper functions: run, all, get, close
export async function openDb() {
  return new Promise<any>((resolve, reject) => {
    const sqlite = sqlite3.verbose();
    const db = new sqlite.Database(dbPath, (err) => {
      if (err) return reject(err);

      // --- helpers ---
      const run = (sql: string, params: any[] = []) =>
        new Promise<void>((res, rej) => {
          db.run(sql, params, function (err) {
            if (err) return rej(err);
            res();
          });
        });

      const all = (sql: string, params: any[] = []) =>
        new Promise<any[]>((res, rej) => {
          db.all(sql, params, (err, rows) => {
            if (err) return rej(err);
            res(rows || []);
          });
        });

      const get = (sql: string, params: any[] = []) =>
        new Promise<any>((res, rej) => {
          db.get(sql, params, (err, row) => {
            if (err) return rej(err);
            res(row);
          });
        });

      const close = () =>
        new Promise<void>((res, rej) => {
          db.close((err) => {
            if (err) return rej(err);
            res();
          });
        });

      // Return helpers + db object
      resolve({ db, run, all, get, close });
    });
  });
}
