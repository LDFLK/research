"use client";

import type { MapOfficerEntry, GeoProfile, Grade } from "@/lib/types";
import GradeBadge from "@/components/GradeBadge";
import DistanceIndicator from "@/components/DistanceIndicator";
import Link from "next/link";
import {
  X,
  MapPin,
  ArrowDown,
  Clock,
  Building2,
  Globe,
  Navigation,
  Loader2,
  ExternalLink,
} from "lucide-react";

const INSTITUTION_TYPE_LABELS: Record<
  string,
  { label: string; color: string }
> = {
  ministry: { label: "Ministry", color: "bg-purple-100 text-purple-700" },
  department: { label: "Department", color: "bg-blue-100 text-blue-700" },
  "divisional-secretariat": {
    label: "Div. Secretariat",
    color: "bg-green-100 text-green-700",
  },
  "district-secretariat": {
    label: "Dist. Secretariat",
    color: "bg-emerald-100 text-emerald-700",
  },
  provincial: { label: "Provincial", color: "bg-teal-100 text-teal-700" },
  municipal: { label: "Municipal", color: "bg-cyan-100 text-cyan-700" },
  commission: { label: "Commission", color: "bg-indigo-100 text-indigo-700" },
  "statutory-body": {
    label: "Statutory Body",
    color: "bg-violet-100 text-violet-700",
  },
  secretariat: { label: "Secretariat", color: "bg-sky-100 text-sky-700" },
};

export default function OfficerTimelinePane({
  officers,
  geoProfiles,
  activeOfficerFileNumber,
  onSetActiveOfficer,
  onRemoveOfficer,
  onClose,
  isLoading,
}: {
  officers: MapOfficerEntry[];
  geoProfiles: Map<string, GeoProfile>;
  activeOfficerFileNumber: string;
  onSetActiveOfficer: (fileNumber: string) => void;
  onRemoveOfficer: (fileNumber: string) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const activeOfficer = officers.find(
    (o) => o.fileNumber === activeOfficerFileNumber
  );
  const profile = geoProfiles.get(activeOfficerFileNumber);

  if (!activeOfficer) return null;

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-gray-900 truncate text-sm">
            {activeOfficer.name}
          </span>
          <GradeBadge grade={activeOfficer.currentGrade} />
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab bar (multi-officer) */}
      {officers.length > 1 && (
        <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
          {officers.map((o) => (
            <button
              key={o.fileNumber}
              onClick={() => onSetActiveOfficer(o.fileNumber)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition ${
                o.fileNumber === activeOfficerFileNumber
                  ? "border-blue-600 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="truncate max-w-[100px]">
                {o.name.split(" ").slice(0, 2).join(" ")}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveOfficer(o.fileNumber);
                }}
                className="p-0.5 rounded hover:bg-gray-200 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && !profile && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Profile content */}
      {profile && (
        <div className="flex-1 overflow-y-auto">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-2 p-3">
            <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Postings
              </div>
              <div className="text-lg font-bold text-gray-900">
                {profile.postings.length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Locations
              </div>
              <div className="text-lg font-bold text-gray-900">
                {profile.totalDistinctLocations}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                Spread
              </div>
              <div className="text-lg font-bold text-gray-900">
                {profile.geographicSpreadKm > 0
                  ? `${Math.round(profile.geographicSpreadKm)} km`
                  : "—"}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 px-3 py-2">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Career
              </div>
              <div className="text-lg font-bold text-gray-900">
                {activeOfficer.firstSeenYear}–{activeOfficer.lastSeenYear}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-3 pb-3 space-y-1">
            {profile.postings.map((posting, idx) => {
              const yearRange =
                posting.years.length === 1
                  ? `${posting.years[0]}`
                  : `${posting.years[0]}–${posting.years[posting.years.length - 1]}`;

              const typeInfo = posting.institutionType
                ? INSTITUTION_TYPE_LABELS[posting.institutionType]
                : null;

              return (
                <div
                  key={`${posting.institutionId || posting.institution}-${posting.years[0]}`}
                >
                  {/* Distance connector */}
                  {idx > 0 && (
                    <div className="flex items-center justify-center py-1">
                      <div className="flex flex-col items-center">
                        <ArrowDown className="h-3.5 w-3.5 text-gray-300" />
                        {posting.distanceFromPrevKm != null && (
                          <DistanceIndicator
                            distanceKm={posting.distanceFromPrevKm}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Posting card */}
                  <div
                    className={`border rounded-lg p-3 bg-white hover:border-gray-300 transition ${
                      posting.isAdministrativeGroup
                        ? "border-l-4 border-l-amber-400 border-gray-200"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Institution name */}
                        <div className="flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            {posting.institutionId ? (
                              <Link
                                href={`/institutions/${encodeURIComponent(posting.institutionId)}`}
                                className="font-semibold text-gray-900 hover:text-blue-600 transition text-sm leading-tight"
                              >
                                {posting.institution}
                              </Link>
                            ) : (
                              <span className="font-semibold text-gray-900 text-sm leading-tight">
                                {posting.institution}
                              </span>
                            )}
                            {(posting.locationName || posting.district) && (
                              <p className="text-xs text-gray-500">
                                {posting.locationName}
                                {posting.locationName && posting.district
                                  ? ", "
                                  : ""}
                                {posting.district}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Posts held */}
                        {posting.posts.length > 0 && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                            <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {posting.posts.join(", ")}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right side: year & duration */}
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {yearRange}
                        </div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                          {posting.durationYears}{" "}
                          {posting.durationYears === 1 ? "yr" : "yrs"}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: grades + type */}
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      {posting.grades.map((g: Grade) => (
                        <GradeBadge key={g} grade={g} size="sm" />
                      ))}
                      {typeInfo && (
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}
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
        </div>
      )}

      {/* No profile yet (not loading) */}
      {!profile && !isLoading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          No profile data available
        </div>
      )}

      {/* Footer link */}
      <div className="px-4 py-2.5 border-t border-gray-200 bg-white">
        <Link
          href={`/officers/${encodeURIComponent(activeOfficerFileNumber)}`}
          className="flex items-center justify-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View full profile
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
