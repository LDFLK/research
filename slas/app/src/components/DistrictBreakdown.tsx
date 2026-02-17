"use client";

import type { GeoProfile } from "@/lib/types";
import { MapPin, Building2, Trees } from "lucide-react";

export default function DistrictBreakdown({
  geoProfile,
}: {
  geoProfile: GeoProfile;
}) {
  const { districtBreakdown, fieldVsHqRatio } = geoProfile;

  if (districtBreakdown.length === 0) return null;

  const maxYears = Math.max(...districtBreakdown.map((d) => d.years));
  const totalFieldHq = fieldVsHqRatio.field + fieldVsHqRatio.hq;

  // Determine if a district is field or HQ based on postings in that district
  const fieldDistricts = new Set<string>();
  const hqDistricts = new Set<string>();
  const fieldTypes = new Set(["divisional-secretariat", "district-secretariat"]);
  for (const posting of geoProfile.postings) {
    const d = posting.district || "Unknown";
    if (fieldTypes.has(posting.institutionType)) {
      fieldDistricts.add(d);
    } else {
      hqDistricts.add(d);
    }
  }

  return (
    <div className="space-y-5">
      {/* District bar chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-gray-400" />
          Years by District
        </h3>
        <div className="space-y-2">
          {districtBreakdown.map((d) => {
            const pct = maxYears > 0 ? (d.years / maxYears) * 100 : 0;
            const isField = fieldDistricts.has(d.district) && !hqDistricts.has(d.district);
            const isHq = hqDistricts.has(d.district) && !fieldDistricts.has(d.district);
            const barColor = isField
              ? "bg-green-500"
              : isHq
                ? "bg-blue-500"
                : "bg-slate-500";

            return (
              <div key={d.district} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-28 truncate flex-shrink-0" title={d.district}>
                  {d.district}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(pct, 8)}%` }}
                  >
                    {pct > 20 && (
                      <span className="text-xs text-white font-medium">
                        {d.years}y
                      </span>
                    )}
                  </div>
                </div>
                {pct <= 20 && (
                  <span className="text-xs text-gray-500 w-8">
                    {d.years}y
                  </span>
                )}
                <span className="text-xs text-gray-400 w-16 text-right">
                  {d.postings} {d.postings === 1 ? "stint" : "stints"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field vs HQ summary */}
      {totalFieldHq > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-gray-400" />
            Field vs. Headquarters
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              {/* Stacked bar */}
              <div className="flex h-6 rounded-full overflow-hidden bg-gray-100">
                {fieldVsHqRatio.field > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center transition-all duration-500"
                    style={{
                      width: `${(fieldVsHqRatio.field / totalFieldHq) * 100}%`,
                    }}
                  >
                    <span className="text-xs text-white font-medium px-1">
                      {fieldVsHqRatio.field}y
                    </span>
                  </div>
                )}
                {fieldVsHqRatio.hq > 0 && (
                  <div
                    className="bg-blue-500 flex items-center justify-center transition-all duration-500"
                    style={{
                      width: `${(fieldVsHqRatio.hq / totalFieldHq) * 100}%`,
                    }}
                  >
                    <span className="text-xs text-white font-medium px-1">
                      {fieldVsHqRatio.hq}y
                    </span>
                  </div>
                )}
              </div>
              {/* Labels */}
              <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Trees className="h-3 w-3 text-green-500" />
                  Field ({fieldVsHqRatio.field} {fieldVsHqRatio.field === 1 ? "year" : "years"})
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-blue-500" />
                  HQ ({fieldVsHqRatio.hq} {fieldVsHqRatio.hq === 1 ? "year" : "years"})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Color legend */}
      <div className="flex gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500 inline-block" /> Field
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-500 inline-block" /> HQ
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-500 inline-block" /> Mixed
        </span>
      </div>
    </div>
  );
}
