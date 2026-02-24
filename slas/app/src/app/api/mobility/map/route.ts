import { NextRequest, NextResponse } from "next/server";
import { getGlobalMapData } from "@/lib/db";
import type { Grade } from "@/lib/types";

const VALID_GRADES = new Set<string>(["SP", "GI", "GII", "GIII"]);

export async function GET(request: NextRequest) {
  const gradesParam = request.nextUrl.searchParams.get("grades");
  let grades: Grade[] | undefined;

  if (gradesParam) {
    grades = gradesParam
      .split(",")
      .filter((g) => VALID_GRADES.has(g)) as Grade[];
    if (grades.length === 0) grades = undefined;
  }

  const data = getGlobalMapData(grades);
  return NextResponse.json(data);
}
