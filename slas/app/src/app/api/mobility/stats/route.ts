import { NextResponse } from "next/server";
import { getMobilityStats } from "@/lib/db";

export async function GET() {
  const stats = getMobilityStats();
  return NextResponse.json(stats);
}
