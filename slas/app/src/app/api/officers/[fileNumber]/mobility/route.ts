import { NextRequest, NextResponse } from "next/server";
import { getOfficerMobility } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { fileNumber: string } }
) {
  const fileNumber = decodeURIComponent(params.fileNumber);
  const result = getOfficerMobility(fileNumber);

  if (!result) {
    return NextResponse.json({ error: "Officer not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
