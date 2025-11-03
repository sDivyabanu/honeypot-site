"use client";

import { useState } from "react";

export default function Search(){
  const [q,setQ] = useState('');
  const [res,setRes] = useState<any>(null);

  async function doSearch(e?: React.FormEvent){
    e && e.preventDefault();
    const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    setRes(await r.json());
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="text-xl font-semibold">Search (SQLi demo)</h2>
        <form onSubmit={doSearch} className="mt-3 flex gap-2">
          <input className="flex-1 p-2 rounded bg-black/20" placeholder="q" value={q} onChange={e=>setQ(e.target.value)} />
          <button className="btn">Search</button>
        </form>
        <pre className="mt-4">{res ? JSON.stringify(res, null, 2) : "Results show here"}</pre>
      </div>
    </div>
  );
}
