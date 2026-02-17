"use client";

import type { Snapshot, OfficerMobility } from "@/lib/types";
import GradeBadge from "./GradeBadge";
import DistanceIndicator from "./DistanceIndicator";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function OfficerTimeline({
  snapshots,
  mobility,
}: {
  snapshots: Snapshot[];
  mobility?: OfficerMobility | null;
}) {
  // Build a lookup: toYear → distanceKm for transfers
  const transferDistances = new Map<number, number | null>();
  if (mobility) {
    for (const t of mobility.transfers) {
      transferDistances.set(t.toYear, t.distanceKm);
    }
  }
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-6">
        {snapshots.map((snap, i) => {
          const prev = i > 0 ? snapshots[i - 1] : null;
          const gradeChanged = prev && prev.grade !== snap.grade;
          const postChanged =
            prev && prev.normalizedPost !== snap.normalizedPost;
          const instChanged =
            prev && prev.normalizedInstitution !== snap.normalizedInstitution;

          return (
            <div key={snap.year} className="relative pl-10">
              <div
                className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 ${
                  gradeChanged
                    ? "bg-purple-500 border-purple-300"
                    : "bg-white border-gray-400"
                }`}
              />
              <div
                className={`border rounded-lg p-4 ${
                  gradeChanged
                    ? "border-purple-200 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono font-bold text-lg text-gray-800">
                    {snap.year}
                  </span>
                  <GradeBadge grade={snap.grade} />
                  {snap.seniorityNo > 0 && (
                    <span className="text-xs text-gray-400">
                      #{snap.seniorityNo}
                    </span>
                  )}
                  {gradeChanged && (
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                      Promoted
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-20 flex-shrink-0">
                      Post:
                    </span>
                    <span
                      className={
                        postChanged ? "font-medium text-sky-700" : "text-gray-700"
                      }
                    >
                      {snap.normalizedPost || snap.rawPost || "—"}
                      {postChanged && (
                        <span className="ml-2 text-xs text-sky-500">
                          (changed)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-20 flex-shrink-0">
                      Institution:
                    </span>
                    <span
                      className={
                        instChanged
                          ? "font-medium text-emerald-700"
                          : "text-gray-700"
                      }
                    >
                      {snap.institutionId ? (
                        <Link
                          href={`/institutions/${encodeURIComponent(snap.institutionId)}`}
                          className="hover:underline"
                        >
                          {snap.normalizedInstitution || snap.workplace || "—"}
                        </Link>
                      ) : (
                        snap.normalizedInstitution || snap.workplace || "—"
                      )}
                      {instChanged && (
                        <>
                          <span className="ml-2 text-xs text-emerald-500">
                            (transferred)
                          </span>
                          {transferDistances.has(snap.year) && (
                            <span className="ml-1">
                              <DistanceIndicator
                                distanceKm={transferDistances.get(snap.year)!}
                              />
                            </span>
                          )}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
