import { NextRequest, NextResponse } from "next/server";
import { getOfficer } from "@/lib/db";
import { decodeFileNumber } from "@/lib/url";

export async function GET(
  _request: NextRequest,
  { params }: { params: { fileNumber: string } }
) {
  const fileNumber = decodeFileNumber(params.fileNumber);
  const result = getOfficer(fileNumber);

  if (!result) {
    return NextResponse.json({ error: "Officer not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
