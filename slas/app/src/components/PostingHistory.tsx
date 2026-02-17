"use client";

import type { GeoProfile } from "@/lib/types";
import GradeBadge from "@/components/GradeBadge";
import DistanceIndicator from "@/components/DistanceIndicator";
import Link from "next/link";
import { MapPin, ArrowDown, Clock, Building2 } from "lucide-react";

const INSTITUTION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  ministry: { label: "Ministry", color: "bg-purple-100 text-purple-700" },
  department: { label: "Department", color: "bg-blue-100 text-blue-700" },
  "divisional-secretariat": { label: "Divisional Secretariat", color: "bg-green-100 text-green-700" },
  "district-secretariat": { label: "District Secretariat", color: "bg-emerald-100 text-emerald-700" },
  provincial: { label: "Provincial", color: "bg-teal-100 text-teal-700" },
  municipal: { label: "Municipal", color: "bg-cyan-100 text-cyan-700" },
  commission: { label: "Commission", color: "bg-indigo-100 text-indigo-700" },
  "statutory-body": { label: "Statutory Body", color: "bg-violet-100 text-violet-700" },
  secretariat: { label: "Secretariat", color: "bg-sky-100 text-sky-700" },
};

export default function PostingHistory({
  geoProfile,
}: {
  geoProfile: GeoProfile;
}) {
  if (geoProfile.postings.length === 0) return null;

  return (
    <div className="space-y-1">
      {geoProfile.postings.map((posting, idx) => {
        const yearRange =
          posting.years.length === 1
            ? `${posting.years[0]}`
            : `${posting.years[0]}–${posting.years[posting.years.length - 1]}`;

        const typeInfo = posting.institutionType
          ? INSTITUTION_TYPE_LABELS[posting.institutionType]
          : null;

        return (
          <div key={`${posting.institutionId || posting.institution}-${posting.years[0]}`}>
            {/* Arrow connector between cards */}
            {idx > 0 && (
              <div className="flex items-center justify-center py-1">
                <div className="flex flex-col items-center">
                  <ArrowDown className="h-4 w-4 text-gray-300" />
                  {posting.distanceFromPrevKm != null && (
                    <DistanceIndicator distanceKm={posting.distanceFromPrevKm} />
                  )}
                </div>
              </div>
            )}

            {/* Posting card */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white hover:border-gray-300 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Institution name */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      {posting.institutionId ? (
                        <Link
                          href={`/institutions/${encodeURIComponent(posting.institutionId)}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition"
                        >
                          {posting.institution}
                        </Link>
                      ) : (
                        <span className="font-semibold text-gray-900">
                          {posting.institution}
                        </span>
                      )}
                      {/* Location + District */}
                      {(posting.locationName || posting.district) && (
                        <p className="text-sm text-gray-500">
                          {posting.locationName}
                          {posting.locationName && posting.district ? ", " : ""}
                          {posting.district}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Posts held */}
                  {posting.posts.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span>{posting.posts.join(" → ")}</span>
                    </div>
                  )}
                </div>

                {/* Right side: year & duration */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {yearRange}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                    {posting.durationYears} {posting.durationYears === 1 ? "year" : "years"}
                  </span>
                </div>
              </div>

              {/* Bottom row: grades + type badge */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {posting.grades.map((g) => (
                  <GradeBadge key={g} grade={g} size="sm" />
                ))}
                {typeInfo && (
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}
                  >
                    {typeInfo.label}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
