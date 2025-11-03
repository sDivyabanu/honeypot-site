import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050a1a] text-slate-100">
      {/* Top Navbar */}
      <nav className="bg-[#0a1128] border-b border-[#1e293b] shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-cyan-400 tracking-wide">
            CodeArena 2025
          </h1>

          <div className="flex gap-8">
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-cyan-400 transition duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/search"
              className="text-slate-300 hover:text-cyan-400 transition duration-200"
            >
              Search
            </Link>
            <Link
              href="/upload"
              className="text-slate-300 hover:text-cyan-400 transition duration-200"
            >
              Upload
            </Link>
            <Link
              href="/comment"
              className="text-slate-300 hover:text-cyan-400 transition duration-200"
            >
              Comments
            </Link>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="p-8">{children}</main>
    </div>
  );
}
