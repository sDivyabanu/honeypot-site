"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sql, setSql] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setSql(data.sql || "");

    if (data.success) {
      localStorage.setItem("hp_auth", "1");
      setMessage("✅ Login successful! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 1000);
    } else {
      setMessage("❌ " + data.message);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden font-sans">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-black animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_#7c3aed22,_transparent_70%)]"></div>

      <div className="relative z-10 bg-black/40 border border-purple-800 rounded-2xl p-10 shadow-[0_0_40px_rgba(124,58,237,0.2)] backdrop-blur-lg w-[400px]">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
          CodeArena Login
        </h1>
        <p className="text-sm text-gray-400 mb-6 text-center">
          Enter your credentials to join the ultimate DSA & CP showdown!
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-all"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center text-sm text-gray-300">{message}</div>
        )}

        {sql && (
          <div className="mt-6 text-xs bg-black/60 border border-gray-800 rounded-lg p-3 overflow-auto text-gray-400">
            <div className="font-semibold text-purple-400 mb-1">Executed SQL:</div>
            <code>{sql}</code>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500 border-t border-gray-800 pt-4">
          <p className="text-center">Demo login — intentionally vulnerable for testing.</p>
        </div>
      </div>
    </main>
  );
}
