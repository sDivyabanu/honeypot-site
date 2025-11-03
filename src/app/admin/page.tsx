import fs from "fs";
import path from "path";

export default async function AdminPage() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  let files: string[] = [];

  try {
    files = fs.readdirSync(uploadsDir);
  } catch (e) {
    files = [];
  }

  return (
    <div>
      <h1>Admin Page</h1>
      <ul>
        {files.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </div>
  );
}
