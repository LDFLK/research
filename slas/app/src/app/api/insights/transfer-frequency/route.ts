import { NextResponse } from "next/server";
import { getTransferFrequencyStats } from "@/lib/db";

export async function GET() {
  const stats = getTransferFrequencyStats();
  return NextResponse.json(stats);
}
