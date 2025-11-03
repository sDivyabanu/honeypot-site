// src/app/comment/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Comment = { id?: number; author: string; body: string; ts: number; payload_type?: string };

function CommentItem({ c }: { c: Comment }) {
  const el = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!el.current) return;

    // Insert raw HTML (vulnerable)
    el.current.innerHTML = c.body || "";

    // Execute any <script> tags by replacing them with new script elements
    const scripts = Array.from(el.current.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      try {
        const newScript = document.createElement("script");
        // copy attributes like src/type/async
        for (let i = 0; i < oldScript.attributes.length; i++) {
          const a = oldScript.attributes[i];
          newScript.setAttribute(a.name, a.value);
        }
        newScript.text = oldScript.textContent || "";
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      } catch (err) {
        // keep going if one script fails
        // console.error("script exec error", err);
      }
    });

    // Note: inline event handlers (onclick/onerror) become live when innerHTML is parsed,
    // so they should already work. The script replacement handles <script> tags.
  }, [c.body]);

  return (
    <div className="p-4 rounded-md bg-gray-800 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{c.author}</div>
        <div className="text-xs text-gray-400">
          {new Date(c.ts * 1000).toLocaleString()}
          {c.payload_type ? ` • ${c.payload_type}` : ""}
        </div>
      </div>

      {/* Deliberate vulnerability: innerHTML + script execution */}
      <div className="prose prose-invert" ref={el} />
    </div>
  );
}

export default function CommentDemoPage() {
  const [author, setAuthor] = useState("alice");
  const [body, setBody] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchComments() {
    setLoading(true);
    try {
      const res = await fetch("/api/comment");
      const data = await res.json();
      if (data.ok) setComments(data.comments ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, body }),
      });
      setBody("");
      await fetchComments();
    } catch (err) {
      console.error(err);
    }
  }

  const examples = {
    bgScript: `<script>document.body.style.background='magenta';document.body.style.color='#fff'</script>`,
    buttonScript: `<script>const b=document.getElementById('postBtn'); if(b) { b.style.background='lime'; b.style.color='#000'; b.textContent='HACKED!' }</script>`,
    imgOnErrorChangeBg: `<img src=x onerror="document.body.style.background='orange'">`,
    imgOnErrorChangeBtn: `<img src=x onerror="document.getElementById('postBtn') && (document.getElementById('postBtn').style.background='hotpink')">`,
    buttonInline: `<button onclick="alert('button clicked')">Click me</button>`,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">XSS Demo — Comments (Vulnerable)</h1>
        <p className="mb-6 text-sm text-gray-400">
          This page intentionally renders user-supplied HTML & scripts. Do not deploy. Local demo only.
        </p>

        <form onSubmit={submit} className="mb-6">
          <div className="flex gap-2 mb-2">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="flex-0 w-36 rounded-md bg-gray-800 text-gray-100 p-2 border border-gray-700"
              placeholder="author"
            />
            <div className="flex-1">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full rounded-md bg-gray-800 text-gray-100 p-3 h-28 border border-gray-700"
                placeholder="Type HTML or script here (e.g. <script>document.body.style.background='red'</script>)"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* <-- id added so payloads can find and modify the button -->
             make this easy for payloads to change */}
            <button
              id="postBtn"
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white shadow"
            >
              Post comment (vulnerable)
            </button>

            <button
              type="button"
              onClick={() => setBody(examples.bgScript)}
              className="px-3 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 text-sm"
            >
              Fill example (bg)
            </button>

            <button
              type="button"
              onClick={() => setBody(examples.buttonScript)}
              className="px-3 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 text-sm"
            >
              Fill example (change post button)
            </button>

            <button
              type="button"
              onClick={() => setBody(examples.imgOnErrorChangeBg)}
              className="px-3 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 text-sm"
            >
              Fill example (img onerror bg)
            </button>

            <button
              type="button"
              onClick={fetchComments}
              className="px-3 py-1 rounded bg-gray-800 border border-gray-700 text-gray-100 text-sm"
            >
              Refresh
            </button>

            <span className="text-xs text-gray-400 ml-auto">Comments: {comments.length}</span>
          </div>
        </form>

        <div className="space-y-4">
          {loading && <div className="text-sm text-gray-400">Loading comments…</div>}

          {comments.map((c) => (
            <CommentItem key={String(c.ts) + c.author} c={c} />
          ))}

          {comments.length === 0 && !loading && (
            <div className="p-4 rounded-md bg-gray-800 border border-gray-700 text-gray-400">No comments yet</div>
          )}
        </div>

        <div className="mt-8 text-xs text-gray-500">
          <strong>Demo tips:</strong> try one of the example fills and press <em>Post comment (vulnerable)</em>.
        </div>
      </div>
    </div>
  );
}
