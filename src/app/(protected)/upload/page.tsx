"use client";
import { useState } from "react";

export default function Upload() {
  const [res, setRes] = useState<any>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await r.json();
    setRes(data);
  }

  return (
    <div className="container p-4">
      <div className="card p-4 shadow-md rounded-lg">
        <h2 className="text-xl font-semibold">Upload (No Validation)</h2>
        <form onSubmit={onSubmit} className="mt-3">
          <label
  htmlFor="fileInput"
  className="block text-sm font-medium text-gray-700"
>
  Choose a file to upload
</label>

<input
  id="fileInput"
  name="file"
  type="file"
  title="Select a file from your computer"
  className="mt-2 border border-gray-300 p-1 rounded"
  required
/>

          <button type="submit" className="btn mt-3 px-4 py-2 bg-blue-500 text-white rounded">
            Upload
          </button>
        </form>

        <pre className="mt-3 bg-grey-100 p-2 rounded">
          {res ? JSON.stringify(res, null, 2) : "Response"}
        </pre>

        <p className="text-sm text-gray-500 mt-2">
          Try uploading <code>shell.php</code> or <code>shell.php.jpg</code>
        </p>
      </div>
    </div>
  );
}
