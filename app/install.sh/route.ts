import { NextRequest, NextResponse } from "next/server";

import { buildInstallScript } from "../lib/installScript";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key") ?? "";
  const endpoint = searchParams.get("endpoint") ?? "https://codexible.me";

  const script = buildInstallScript(key, endpoint);

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
