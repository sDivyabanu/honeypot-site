// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type FileInfo = {
  filename: string;
  savedAt: string;
  size?: number;
  mtime?: string;
};

type UploadLog = {
  timestamp: string;
  filename?: string;
  savedAt?: string;
  size?: number;
  ip?: string;
  userAgent?: string;
  [k: string]: any;
};

type Comment = {
  id?: number;
  author?: string;
  body: string;
  ts: number;
  payload_type?: string;
};

type Attack = {
  id?: number;
  q?: string;
  sql?: string;
  ip?: string;
  user_agent?: string;
  created_at?: string;
  route?: string;
  [k: string]: any;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [uploadLogs, setUploadLogs] = useState<UploadLog[]>([]);

  const [comments, setComments] = useState<Comment[]>([]);

  // Attacks may be a dedicated endpoint or not exist yet — handle gracefully
  const [attacks, setAttacks] = useState<Attack[] | null>(null);
  const [loginLogs, setLoginLogs] = useState<any[] | null>(null);
  const [searchLogs, setSearchLogs] = useState<any[] | null>(null);

  useEffect(() => {
    setLoading(true);
    setErr(null);

    async function loadAll() {
      try {
        // 1) Uploads
        try {
          const res = await fetch("/api/upload");
          if (res.ok) {
            const json = await res.json();
            setFiles(json.files ?? []);
            setUploadLogs(json.logs ?? []);
          } else {
            // if API returns 404/500: swallow (we'll show message)
            setFiles([]);
            setUploadLogs([]);
          }
        } catch (e) {
          console.warn("Failed to fetch /api/upload", e);
          setFiles([]);
          setUploadLogs([]);
        }

        // 2) Comments
        try {
          const res = await fetch("/api/comment");
          if (res.ok) {
            const json = await res.json();
            setComments(json.comments ?? []);
          } else {
            setComments([]);
          }
        } catch (e) {
          console.warn("Failed to fetch /api/comment", e);
          setComments([]);
        }

        // 3) Attacks (optional endpoint)
        try {
          const res = await fetch("/api/attacks");
          if (res.ok) {
            const json = await res.json();
            setAttacks(json.attacks ?? (json || []));
          } else {
            setAttacks(null); // endpoint not available
          }
        } catch (e) {
          console.warn("no /api/attacks or fetch failed", e);
          setAttacks(null);
        }

        // 4) Login logs (optional)
        try {
          const res = await fetch("/api/login/logs");
          if (res.ok) {
            const json = await res.json();
            setLoginLogs(json.logs ?? (json || []));
          } else {
            setLoginLogs(null);
          }
        } catch (e) {
          setLoginLogs(null);
        }

        // 5) Search logs (optional)
        try {
          const res = await fetch("/api/search/logs");
          if (res.ok) {
            const json = await res.json();
            setSearchLogs(json.logs ?? (json || []));
          } else {
            setSearchLogs(null);
          }
        } catch (e) {
          setSearchLogs(null);
        }
      } catch (e: any) {
        setErr(String(e));
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // derive attack counts & simple heuristics
  const summary = useMemo(() => {
    const counts: Record<string, number> = {
      xss: 0,
      sqli: 0,
      upload: 0,
      other: 0,
    };

    // comments: payload_type 'xss'
    comments.forEach((c) => {
      if (c.payload_type === "xss") counts.xss++;
      else counts.other++;
    });

    // uploads: each upload may be suspicious if filename contains .php/.jsp/.exe etc
    uploadLogs.forEach((u) => {
      const fname = String(u.filename || "");
      const suspiciousExt = fname.match(/\.(php|jsp|asp|aspx|exe|sh|pl|py)$/i);
      if (suspiciousExt) counts.upload++;
    });

    // attacks table: analyze sql column if available
    if (attacks && Array.isArray(attacks)) {
      attacks.forEach((a) => {
        const s = String(a.sql || "").toLowerCase();
        const q = String(a.q || "").toLowerCase();
        if (
          s.includes("where") &&
          (s.includes("' or ") || s.includes(" or ") || q.includes("' or "))
        ) {
          counts.sqli++;
        } else if (s.includes("<script") || q.includes("<script")) {
          counts.xss++;
        } else counts.other++;
      });
    }

    // searchLogs/loginLogs could also be used similarly if provided
    return counts;
  }, [comments, uploadLogs, attacks]);

  // compute a naive vulnerability score (0..100)
  const vulnScore = useMemo(() => {
    const totalAttacks =
      summary.xss + summary.sqli + summary.upload + summary.other;
    // base score: more attacks -> higher score; if no data -> neutral 20
    if (totalAttacks === 0) return 20;
    // weight sqli & xss heavier
    const weighted =
      summary.sqli * 3 + summary.xss * 3 + summary.upload * 2 + summary.other;
    const score = Math.min(
      90,
      Math.round((weighted / (totalAttacks + 1)) * 20 + 10)
    );
    return score;
  }, [summary]);

  // small helper to format timestamp
  const fmt = (ts?: any) => {
    try {
      if (!ts) return "-";
      const d = new Date(ts);
      if (isNaN(d.getTime())) return String(ts);
      return d.toLocaleString();
    } catch {
      return String(ts);
    }
  };

  // simple bar take for counts visualization
  const totalCount =
    summary.xss + summary.sqli + summary.upload + summary.other || 1;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Honeypot Dashboard
            </h1>
            <p className="text-sm text-gray-400">
              Aggregates uploads, comments, login & search activity — demo only.
            </p>
          </div>

          <div className="ml-auto text-right">
            <div className="text-xs text-gray-400">Status</div>
            <div className="inline-flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                }`}
                aria-hidden
              />
              <div className="text-sm">
                {loading ? "Loading…" : "Live (local)"}
              </div>
            </div>
          </div>
        </header>

        {/* Top summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 p-4 rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-800/40 border border-gray-700 shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400">Vulnerability Score</div>
                <div className="text-2xl font-bold">{vulnScore}/100</div>
              </div>
              <div className="w-20 h-20">
                {/* simple circular progress */}
                <svg viewBox="0 0 36 36" className="w-20 h-20">
                  <path
                    d="M18 2.0845a15.9155 15.9155 0 1 0 0 31.831"
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845a15.9155 15.9155 0 1 0 0 31.831"
                    fill="none"
                    stroke="url(#g1)"
                    strokeWidth="4"
                    strokeDasharray={`${vulnScore}, 100`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop offset="0" stopColor="#ef4444" />
                      <stop offset="1" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-300">
              Score is a simple heuristic: more detected attacks
              (XSS/SQLi/upload attempts) increase risk. Use this as a demo
              metric — not a real CVSS.
            </div>

            <div className="mt-3 text-xs text-gray-400">
              <strong>Quick advice:</strong>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Sanitize user input (DOMPurify for HTML).</li>
                <li>
                  Use parameterized queries (prepared statements) to prevent
                  SQLi.
                </li>
                <li>Validate upload types & store outside webroot.</li>
                <li>Use CSP & escape outputs.</li>
              </ul>
            </div>
          </div>

          <div className="col-span-1 p-4 rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-800/40 border border-gray-700 shadow">
            <div className="text-xs text-gray-400">Attack breakdown</div>
            <div className="mt-3 flex gap-3 items-center">
              <div className="flex-1">
                <div className="text-sm text-gray-300">XSS</div>
                <div className="text-lg font-semibold">{summary.xss}</div>

                <div className="mt-3 text-sm text-gray-300">SQLi</div>
                <div className="text-lg font-semibold">{summary.sqli}</div>

                <div className="mt-3 text-sm text-gray-300">
                  Upload attempts
                </div>
                <div className="text-lg font-semibold">{summary.upload}</div>
              </div>

              <div className="w-36">
                {/* small stacked bar */}
                <div className="h-28 w-full bg-gray-800 rounded overflow-hidden flex flex-col-reverse">
                  <div
                    style={{ height: `${(summary.xss / totalCount) * 100}%` }}
                    className="bg-pink-600 w-full"
                    title="XSS"
                  />
                  <div
                    style={{ height: `${(summary.sqli / totalCount) * 100}%` }}
                    className="bg-red-500 w-full"
                    title="SQLi"
                  />
                  <div
                    style={{
                      height: `${(summary.upload / totalCount) * 100}%`,
                    }}
                    className="bg-yellow-500 w-full"
                    title="Upload"
                  />
                  <div
                    style={{ height: `${(summary.other / totalCount) * 100}%` }}
                    className="bg-gray-600 w-full"
                    title="Other"
                  />
                </div>
                <div className="text-xs text-gray-400 mt-2">relative share</div>
              </div>
            </div>
          </div>

          <div className="col-span-1 p-4 rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-800/40 border border-gray-700 shadow relative">
  <div className="text-xs text-gray-400">Quick actions</div>
  <div className="mt-3 space-y-2">
    <button
      onClick={() => setShowModal(true)}
      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded px-3 py-2 shadow"
    >
      Show remediation checklist
    </button>

    <button
      onClick={() => {
        setLoading(true);
        setErr(null);
        window.location.reload();
      }}
      className="w-full bg-gray-800 hover:bg-gray-700 text-gray-100 rounded px-3 py-2 border"
    >
      Refresh all data
    </button>
  </div>

  {/* Modal popup (no external libs) */}
  {showModal && (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-gray-900 text-gray-100 rounded-2xl p-6 w-96 border border-gray-700 shadow-xl relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-lg font-semibold mb-3 text-indigo-400">
          🛡️ Remediation Checklist
        </h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Use parameterized SQL queries</li>
          <li>Escape HTML output or use DOMPurify</li>
          <li>Validate file types & store outside /public</li>
          <li>Enable CSP with <code>'script-src'</code> restrictions</li>
        </ul>

        <div className="mt-5 text-right">
          <button
            onClick={() => setShowModal(false)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded text-white text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )}
</div>

        </div>

        {/* Recent activity panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          {/* Uploads panel */}
          <section className="col-span-1 lg:col-span-1 p-4 rounded-2xl bg-gray-800 border border-gray-700 shadow">
            <h3 className="text-lg font-semibold">Uploads</h3>
            <p className="text-xs text-gray-400">
              Files uploaded to the app (most recent first)
            </p>

            <div className="mt-3 space-y-2 max-h-56 overflow-auto">
              {uploadLogs.length === 0 && (
                <div className="text-sm text-gray-400">No upload logs yet.</div>
              )}
              {uploadLogs.map((l, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-gray-900/40 border border-gray-700 flex items-start justify-between"
                >
                  <div className="text-sm">
                    <div className="font-medium break-all">
                      {l.filename || "unknown"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {fmt(l.timestamp)}
                    </div>
                    <div className="text-xs text-gray-400">
                      IP: {l.ip || "unknown"}
                    </div>
                    <div className="text-xs text-gray-400">
                      UA:{" "}
                      <span className="break-all">{l.userAgent || "-"}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <a
                      href={l.savedAt}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 text-sm underline"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Comments panel */}
          <section className="col-span-1 lg:col-span-1 p-4 rounded-2xl bg-gray-800 border border-gray-700 shadow">
            <h3 className="text-lg font-semibold">
              Comments (user-supplied HTML)
            </h3>
            <p className="text-xs text-gray-400">
              Shows XSS payload types detected in comments
            </p>

            <div className="mt-3 max-h-56 overflow-auto space-y-2">
              {comments.length === 0 && (
                <div className="text-sm text-gray-400">No comments yet.</div>
              )}
              {comments.map((c, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-gray-900/40 border border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {c.author || "anon"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {fmt((c.ts || 0) * 1000)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-300 break-all">
                    <pre className="whitespace-pre-wrap">{c.body}</pre>
                  </div>
                  <div className="mt-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        c.payload_type === "xss"
                          ? "bg-pink-600 text-black"
                          : "bg-gray-700 text-gray-200"
                      }`}
                    >
                      {c.payload_type ?? "text"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Attacks / Search / Login panel */}
          <section className="col-span-1 lg:col-span-1 p-4 rounded-2xl bg-gray-800 border border-gray-700 shadow">
            <h3 className="text-lg font-semibold">Search / Login / Attacks</h3>
            <p className="text-xs text-gray-400">
              Search & login attack logs (if your server exposes them)
            </p>

            <div className="mt-3 space-y-2 max-h-56 overflow-auto">
              {/* Attacks if present */}
              {attacks === null && (
                <div className="text-sm text-gray-400">
                  No /api/attacks endpoint found — implement to log SQLi & other
                  attacks.
                </div>
              )}
              {Array.isArray(attacks) && attacks.length === 0 && (
                <div className="text-sm text-gray-400">
                  No recorded attacks yet.
                </div>
              )}
              {Array.isArray(attacks) &&
                attacks.slice(0, 10).map((a, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-gray-900/40 border border-gray-700"
                  >
                    <div className="text-xs text-gray-300 break-all">
                      {a.sql || a.q || JSON.stringify(a)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      IP: {a.ip || "unknown"} • {fmt(a.created_at)}
                    </div>
                  </div>
                ))}

              {loginLogs === null ? (
                <div className="text-sm text-gray-400">
                  No /api/login/logs endpoint — login attempts not collected.
                </div>
              ) : (
                loginLogs.slice(0, 6).map((l, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-gray-900/40 border border-gray-700"
                  >
                    <div className="text-sm">
                      {l.username || "?"} —{" "}
                      <span className="text-xs text-gray-400">
                        {l.result || "?"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {fmt(l.timestamp)}
                    </div>
                  </div>
                ))
              )}

              {searchLogs === null ? (
                <div className="text-sm text-gray-400 mt-2">
                  No /api/search/logs endpoint — search queries not listed here.
                </div>
              ) : (
                searchLogs.slice(0, 6).map((s, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-gray-900/40 border border-gray-700"
                  >
                    <div className="text-xs text-gray-300 break-all">
                      {s.q || s.sql}
                    </div>
                    <div className="text-xs text-gray-400">
                      {fmt(s.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Extra help & resources */}
        <section className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-800/30 border border-gray-700 shadow">
          <h3 className="text-lg font-semibold">
            How vulnerable is each page & how to fix it
          </h3>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <article className="p-3 bg-gray-900/40 rounded border border-gray-700">
              <h4 className="font-semibold">Login (SQL Injection)</h4>
              <p className="text-sm text-gray-300 mt-1">
                Risk: high if raw SQL is built from user input.
              </p>
              <ul className="text-xs text-gray-400 mt-2 list-disc ml-4 space-y-1">
                <li>Use parameterized queries / prepared statements.</li>
                <li>Never concatenate input into SQL strings.</li>
                <li>Log suspicious queries to attacks table for analysis.</li>
              </ul>
            </article>

            <article className="p-3 bg-gray-900/40 rounded border border-gray-700">
              <h4 className="font-semibold">Comments (XSS)</h4>
              <p className="text-sm text-gray-300 mt-1">
                Risk: high because comments are rendered as HTML
              </p>
              <ul className="text-xs text-gray-400 mt-2 list-disc ml-4 space-y-1">
                <li>
                  Escape user content when rendering (React escapes by default).
                </li>
                <li>
                  If you must allow HTML, sanitize with DOMPurify on the server
                  or client.
                </li>
                <li>
                  Use a strict Content-Security-Policy (CSP) to limit script
                  execution.
                </li>
              </ul>
            </article>

            <article className="p-3 bg-gray-900/40 rounded border border-gray-700">
              <h4 className="font-semibold">Uploads</h4>
              <p className="text-sm text-gray-300 mt-1">
                Risk: medium–high if uploaded files are served directly.
              </p>
              <ul className="text-xs text-gray-400 mt-2 list-disc ml-4 space-y-1">
                <li>Validate file type & content, not just extension.</li>
                <li>
                  Store files outside the public webroot or serve via signed
                  URLs.
                </li>
                <li>
                  Rename files and set restrictive permissions on storage.
                </li>
              </ul>
            </article>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Show both the vulnerable and fixed variants during your demo. If you
            want, I can produce a fixed-version branch that:
            <ol className="list-decimal ml-6 mt-2">
              <li>Escapes comment output or uses DOMPurify.</li>
              <li>Rewrites login to use parameterized statements.</li>
              <li>
                Hardens upload handling (type checks + storage outside public).
              </li>
            </ol>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-6 text-xs text-gray-500 text-center">
          Honeypot demo — for local/in-class use only. Do not publish this
          vulnerable app.
        </footer>
      </div>
    </div>
  );
}
