import { NextResponse } from "next/server";
import { appendFile } from "node:fs/promises";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const line = JSON.stringify(payload) + "\n";
    await appendFile(process.cwd() + "/debug-55dc61.log", line, { encoding: "utf8" });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

