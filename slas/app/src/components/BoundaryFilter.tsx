"use client";

import { useMemo } from "react";
import type { BoundaryMeta, GeoFilter } from "@/lib/types";
import { MapPin, X } from "lucide-react";

export default function BoundaryFilter({
  geoFilter,
  onFilterChange,
  boundaryMeta,
  filteredCount,
}: {
  geoFilter: GeoFilter;
  onFilterChange: (filter: GeoFilter) => void;
  boundaryMeta: BoundaryMeta | null;
  filteredCount?: number;
}) {
  const districtOptions = useMemo(() => {
    if (!boundaryMeta) return [];
    if (geoFilter.provinceCode) {
      return boundaryMeta.districts.filter(
        (d) => d.provinceCode === geoFilter.provinceCode
      );
    }
    return boundaryMeta.districts;
  }, [boundaryMeta, geoFilter.provinceCode]);

  if (!boundaryMeta) return null;

  const hasFilter = geoFilter.provinceCode || geoFilter.districtName;

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />

      {/* Province select */}
      <select
        value={geoFilter.provinceCode ?? ""}
        onChange={(e) => {
          const code = e.target.value || null;
          onFilterChange({ provinceCode: code, districtName: null });
        }}
        className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Provinces</option>
        {boundaryMeta.provinces.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>

      {/* District select */}
      <select
        value={geoFilter.districtName ?? ""}
        onChange={(e) => {
          const name = e.target.value || null;
          if (name) {
            // Auto-infer province from district
            const dist = boundaryMeta.districts.find((d) => d.name === name);
            onFilterChange({
              provinceCode: dist?.provinceCode ?? geoFilter.provinceCode,
              districtName: name,
            });
          } else {
            onFilterChange({
              provinceCode: geoFilter.provinceCode,
              districtName: null,
            });
          }
        }}
        className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Districts</option>
        {districtOptions.map((d) => (
          <option key={d.code} value={d.name}>
            {d.name}
          </option>
        ))}
      </select>

      {/* Clear button */}
      {hasFilter && (
        <button
          onClick={() =>
            onFilterChange({ provinceCode: null, districtName: null })
          }
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          title="Clear geographic filter"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Filtered count badge */}
      {hasFilter && filteredCount != null && (
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {filteredCount.toLocaleString()} officers
        </span>
      )}
    </div>
  );
}
