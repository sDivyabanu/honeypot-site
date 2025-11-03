'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  // small pulse for accent animation
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse(p => (p + 1) % 360), 2500);
    return () => clearInterval(id);
  }, []);

  const accentGradient = `linear-gradient(90deg, rgba(6,182,212,0.12), rgba(124,58,237,0.12))`;

  return (
    <main className="min-h-screen bg-[#05060a] text-slate-100 font-inter antialiased overflow-x-hidden">
      {/* ambient code-grid background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(ellipse at 10% 10%, rgba(14,165,233,0.06), transparent 8%), radial-gradient(ellipse at 90% 90%, rgba(124,58,237,0.04), transparent 10%), linear-gradient(180deg,#02030a,#091025)',
            filter: 'blur(20px)',
          }}
        />
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="p1" width="160" height="160" patternUnits="userSpaceOnUse">
              <path d="M0 0H160V160" stroke="rgba(255,255,255,0.01)" strokeWidth="1" />
              <path d="M0 20H160M0 40H160M0 60H160M0 80H160M0 100H160M0 120H160M0 140H160" stroke="rgba(255,255,255,0.01)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#p1)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* NAV */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#7c3aed] flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-black">
                <path d="M3 12h18M12 3v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">CodeArena — CP Fest 2025</h1>
              <p className="text-xs text-slate-400">A competitive programming carnival — DSA, puzzles, leaderboards & prizes.</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <a href="#about" className="text-sm text-slate-300 hover:text-white">About</a>
            <a href="#schedule" className="text-sm text-slate-300 hover:text-white">Schedule</a>
            <a href="#prizes" className="text-sm text-slate-300 hover:text-white">Prizes</a>
            <a href="#leaderboard" className="text-sm text-slate-300 hover:text-white">Leaderboard</a>
            <Link href="/login" className="ml-4 px-4 py-2 rounded-md bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-black font-semibold shadow">
              Sign in / Register
            </Link>
          </nav>
        </header>

        {/* HERO */}
        <section className="grid grid-cols-12 gap-6 items-center mb-12">
          <div className="col-span-7">
            <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), transparent)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: accentGradient }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="inline-block"><path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  DSA • CP • Live
                </span>
                <span className="text-xs text-slate-400">Nov 28 — 30, 2025 · Virtual + Onsite</span>
              </div>

              <h2 className="text-4xl font-extrabold leading-tight mb-4">CodeArena: The Ultimate DSA Showdown</h2>
              <p className="text-slate-300 mb-6 max-w-2xl">Compete in algorithmic battles, sprint through time-based puzzles and climb a live leaderboard. Track your progress, earn badges & win cash/prizes. Perfect for students, hobbyists and interview prep warriors.</p>

              <div className="flex items-center gap-3">
                <Link href="/tickets" className="px-5 py-3 rounded-full bg-[#0ea5e9] text-black font-semibold shadow">Get Tickets</Link>
                <a href="#schedule" className="px-4 py-3 rounded-full border border-slate-700 text-slate-200">See Schedule</a>
                <Link href="/login" className="px-4 py-3 rounded-full border border-transparent bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-black">Attendee Area</Link>
              </div>

              {/* quick stats card */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs text-slate-400">Participants</div>
                  <div className="text-lg font-bold">1.2k+</div>
                </div>
                <div className="p-4 rounded-lg border" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs text-slate-400">Tracks</div>
                  <div className="text-lg font-bold">Algorithms · CTF · Speed</div>
                </div>
                <div className="p-4 rounded-lg border" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-xs text-slate-400">Prize Pool</div>
                  <div className="text-lg font-bold">₹150,000 + Swag</div>
                </div>
              </div>
            </div>
          </div>

          {/* hero right — stylized code console / badges */}
          <div className="col-span-5">
            <div className="rounded-2xl p-6 border" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))' }}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Live Arena</h3>
                  <div className="text-xs text-slate-400">Rooms filling fast — reserve a slot</div>
                </div>
                <div className="text-xs text-slate-400">UTC 10:00</div>
              </div>

              {/* faux terminal */}
              <div className="rounded-md overflow-hidden border border-slate-800 bg-[#01020a] shadow-inner">
                <div className="px-4 py-3 text-xs font-mono text-green-300 bg-[#03030a] border-b border-slate-800">→ initialising arena ...</div>
                <div className="p-4 text-sm font-mono text-slate-300 space-y-2">
                  <div><strong>server:</strong> arena.codearena.local</div>
                  <div><strong>open-challenges:</strong> 24</div>
                  <div><strong>current-leader:</strong> <span className="text-indigo-300">dev_ranger</span></div>
                </div>
                <div className="px-4 py-3 text-xs text-slate-400 bg-[#03030a]">Tip: Practice two-pointer & graph rounds for quick XP.</div>
              </div>

              {/* badges */}
              <div className="mt-4 flex gap-3">
                <div className="flex-1 p-3 rounded-lg border text-center">
                  <div className="text-sm text-slate-400">Starter</div>
                  <div className="font-semibold">Beginner Track</div>
                </div>
                <div className="flex-1 p-3 rounded-lg border text-center">
                  <div className="text-sm text-slate-400">Pro</div>
                  <div className="font-semibold">Advanced Battles</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ABOUT / DETAILS */}
        <section id="about" className="mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl p-6 border" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <h3 className="text-2xl font-bold mb-3">About CodeArena</h3>
              <p className="text-slate-300 mb-4">CodeArena is a three-day competitive programming festival focusing on data structures & algorithms, speed coding and capture-the-flag style puzzles. Whether you’re prepping for interviews or learning advanced topics — CodeArena gives real-time ranking, mentoring sessions and industry challenges.</p>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded border">
                  <div className="text-xs text-slate-400">Format</div>
                  <div className="font-semibold mt-1">Timed rounds, live ranking</div>
                </div>
                <div className="p-4 rounded border">
                  <div className="text-xs text-slate-400">Who</div>
                  <div className="font-semibold mt-1">Students, Devs, CP Enthusiasts</div>
                </div>
                <div className="p-4 rounded border">
                  <div className="text-xs text-slate-400">Tools</div>
                  <div className="font-semibold mt-1">Python, C++, Java, JS</div>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl p-6 border" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <h4 className="text-lg font-semibold mb-2">Key Info</h4>
              <ul className="text-sm text-slate-300 space-y-2">
                <li><strong>Date:</strong> Nov 28—30, 2025</li>
                <li><strong>Mode:</strong> Hybrid (Online + Onsite)</li>
                <li><strong>Registration:</strong> ₹199 (students ₹99)</li>
                <li><strong>Contact:</strong> support@codearena.org</li>
              </ul>
              <div className="mt-4">
                <Link href="/tickets" className="block px-4 py-2 rounded bg-[#06b6d4] text-black text-center font-semibold">Buy Tickets</Link>
              </div>
            </aside>
          </div>
        </section>

        {/* SCHEDULE SNAPSHOT */}
        <section id="schedule" className="mb-12">
          <h3 className="text-2xl font-bold mb-4">Schedule Snapshot</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <div className="text-xs text-slate-400">Day 1</div>
              <div className="font-semibold">Keynote: Modern DS</div>
              <div className="text-sm text-slate-400 mt-2">Intro & Strategy session</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-xs text-slate-400">Day 2</div>
              <div className="font-semibold">Speed Rounds</div>
              <div className="text-sm text-slate-400 mt-2">Quickfire algorithmic challenges</div>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="text-xs text-slate-400">Day 3</div>
              <div className="font-semibold">Finals & Awards</div>
              <div className="text-sm text-slate-400 mt-2">Top 10 battle for the prize pool</div>
            </div>
          </div>
        </section>

        {/* PRIZES & LEADERBOARD */}
        <section id="prizes" className="mb-12 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <h3 className="text-2xl font-bold mb-3">Prizes</h3>
            <p className="text-slate-300 mb-4">Top performers take home cash rewards, internship offers and sponsored hardware. Everyone gets participation badges.</p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded border text-center">
                <div className="text-sm text-slate-400">1st</div>
                <div className="text-xl font-bold">₹75,000</div>
                <div className="text-xs text-slate-400 mt-1">+ Internship</div>
              </div>
              <div className="p-4 rounded border text-center">
                <div className="text-sm text-slate-400">2nd</div>
                <div className="text-xl font-bold">₹40,000</div>
                <div className="text-xs text-slate-400 mt-1">+ Swag</div>
              </div>
              <div className="p-4 rounded border text-center">
                <div className="text-sm text-slate-400">3rd</div>
                <div className="text-xl font-bold">₹25,000</div>
                <div className="text-xs text-slate-400 mt-1">+ Swag</div>
              </div>
            </div>
          </div>

          <aside id="leaderboard" className="p-6 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.01)' }}>
            <h4 className="text-lg font-semibold mb-3">Live Leaderboard</h4>
            <ol className="list-decimal ml-4 space-y-2 text-slate-300">
              <li><strong>dev_ranger</strong> — 1240 pts</li>
              <li><strong>algo_ace</strong> — 1100 pts</li>
              <li><strong>byte_ninja</strong> — 980 pts</li>
            </ol>

            <div className="mt-4">
              <Link href="/leaderboard" className="px-3 py-2 rounded bg-[#7c3aed] text-black font-semibold">View full board</Link>
            </div>
          </aside>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-12">
          <h3 className="text-2xl font-bold mb-4">FAQ</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded border">
              <div className="font-semibold">Who can join?</div>
              <div className="text-sm text-slate-300 mt-2">Anyone with programming basics — students & professionals welcome.</div>
            </div>
            <div className="p-4 rounded border">
              <div className="font-semibold">Are teams allowed?</div>
              <div className="text-sm text-slate-300 mt-2">Solo mode for ranked rounds; team mode for specific workshops.</div>
            </div>
            <div className="p-4 rounded border">
              <div className="font-semibold">How to prepare?</div>
              <div className="text-sm text-slate-300 mt-2">Practice DS fundamentals and common CP patterns (two pointers, graphs, dp).</div>
            </div>
          </div>
        </section>

        {/* CTA / footer */}
        <section className="rounded-2xl p-6 border mb-8" style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.03), rgba(124,58,237,0.03))' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xl font-bold">Ready to battle?</h4>
              <p className="text-slate-300">Sign up now and secure your spot in CodeArena — badges, cash prizes and glory await.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/tickets" className="px-5 py-3 rounded-full bg-[#06b6d4] text-black font-semibold">Buy Ticket</Link>
              <Link href="/login" className="px-5 py-3 rounded-full border border-slate-700">Sign in / Register</Link>
            </div>
          </div>
        </section>

        <footer className="text-sm text-slate-500 text-center py-6">
          © CodeArena 2025 — Student-run event. For demo use only.
        </footer>
      </div>

      {/* small styling tweaks */}
      <style jsx>{`
        /* font fallback if Inter not available */
        :global(body){ font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
        a { text-decoration: none; }
        .rounded-2xl { border-radius: 14px; }
      `}</style>
    </main>
  );
}
