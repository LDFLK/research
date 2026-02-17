import { NextRequest, NextResponse } from "next/server";
import { getInstitution } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = decodeURIComponent(params.id);
  const result = getInstitution(id);

  if (!result) {
    return NextResponse.json(
      { error: "Institution not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
