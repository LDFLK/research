import { NextRequest, NextResponse } from "next/server";
import { getTopCoServiceInstitutions, getInstitutionCoService } from "@/lib/db";

export async function GET(request: NextRequest) {
  const institutionId = request.nextUrl.searchParams.get("institutionId");

  if (institutionId) {
    const data = getInstitutionCoService(institutionId);
    return NextResponse.json(data);
  }

  const institutions = getTopCoServiceInstitutions(30);
  return NextResponse.json({ institutions });
}
