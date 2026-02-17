import { NextRequest, NextResponse } from "next/server";
import { searchInstitutions } from "@/lib/db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q") || undefined;
  const type = params.get("type") || undefined;
  const page = params.get("page") ? parseInt(params.get("page")!) : 1;
  const limit = params.get("limit") ? parseInt(params.get("limit")!) : 50;

  const result = searchInstitutions({ q, type, page, limit });
  return NextResponse.json(result);
}
