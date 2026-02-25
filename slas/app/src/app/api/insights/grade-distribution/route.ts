import { NextRequest, NextResponse } from "next/server";
import { getGradeBalanceRanking, getInstitutionGradeHistory } from "@/lib/db";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const institutionId = params.get("institutionId");
  const year = params.get("year");
  const ranking = params.get("ranking");

  if (institutionId) {
    const data = getInstitutionGradeHistory(institutionId);
    return NextResponse.json({ history: data });
  }

  if (ranking && year) {
    const data = getGradeBalanceRanking(parseInt(year), 50);
    return NextResponse.json({ ranking: data });
  }

  return NextResponse.json({ error: "Provide ?year=X&ranking=true or ?institutionId=X" }, { status: 400 });
}
