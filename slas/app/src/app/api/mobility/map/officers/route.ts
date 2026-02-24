import { NextRequest, NextResponse } from "next/server";
import { searchOfficersForMap } from "@/lib/db";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";

  if (q.length < 2) {
    return NextResponse.json({ officers: [] });
  }

  const officers = searchOfficersForMap(q);
  return NextResponse.json({ officers });
}
