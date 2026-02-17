import { NextRequest, NextResponse } from "next/server";
import { searchOfficers } from "@/lib/db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q") || undefined;
  const grade = params.get("grade") || undefined;
  const year = params.get("year") ? parseInt(params.get("year")!) : undefined;
  const page = params.get("page") ? parseInt(params.get("page")!) : 1;
  const limit = params.get("limit") ? parseInt(params.get("limit")!) : 50;

  const result = searchOfficers({ q, grade, year, page, limit });
  return NextResponse.json(result);
}
