"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import type {
  GlobalMapData,
  Grade,
  MapOfficerEntry,
  BoundaryMeta,
  GeoFilter,
} from "@/lib/types";
import { fetchBoundaryMeta } from "@/lib/geo-boundaries";
import GradeFilterBar from "./GradeFilterBar";
import BoundaryFilter from "./BoundaryFilter";
import OfficerPicker from "./OfficerPicker";
import { Loader2 } from "lucide-react";

const GlobalMobilityMap = dynamic(() => import("./GlobalMobilityMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
});

const ALL_GRADES = new Set<Grade>(["SP", "GI", "GII", "GIII"]);

export default function GlobalMobilityPage() {
  const [mapData, setMapData] = useState<GlobalMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeGrades, setActiveGrades] = useState<Set<Grade>>(
    new Set(ALL_GRADES)
  );
  const [selectedOfficers, setSelectedOfficers] = useState<MapOfficerEntry[]>(
    []
  );
  const [geoFilter, setGeoFilter] = useState<GeoFilter>({
    provinceCode: null,
    districtName: null,
  });
  const [boundaryMeta, setBoundaryMeta] = useState<BoundaryMeta | null>(null);

  // Fetch all map data once on mount
  useEffect(() => {
    fetch("/api/mobility/map")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch map data");
        return res.json();
      })
      .then((data: GlobalMapData) => {
        setMapData(data);
        if (data.years.length > 0) {
          setSelectedYear(data.years[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Load boundary metadata on mount
  useEffect(() => {
    fetchBoundaryMeta()
      .then(setBoundaryMeta)
      .catch(() => {});
  }, []);

  // Build the set of district names belonging to the selected province
  const provinceDistrictSet = useMemo(() => {
    if (!geoFilter.provinceCode || !boundaryMeta) return null;
    return new Set(
      boundaryMeta.districts
        .filter((d) => d.provinceCode === geoFilter.provinceCode)
        .map((d) => d.name)
    );
  }, [geoFilter.provinceCode, boundaryMeta]);

  // Compute filtered map data based on geo filter
  const filteredMapData = useMemo<GlobalMapData | null>(() => {
    if (!mapData) return null;
    const hasFilter = geoFilter.provinceCode || geoFilter.districtName;
    if (!hasFilter) return mapData;

    return {
      ...mapData,
      frames: mapData.frames.map((frame) => ({
        ...frame,
        points: frame.points.filter((pt) => {
          if (!pt.district) return false;
          if (geoFilter.districtName) return pt.district === geoFilter.districtName;
          if (provinceDistrictSet) return provinceDistrictSet.has(pt.district);
          return true;
        }),
      })),
    };
  }, [mapData, geoFilter, provinceDistrictSet]);

  // Handle year changes from the map (including auto-advance signal)
  const handleYearChange = useCallback(
    (year: number) => {
      if (year === -1 && mapData) {
        // Auto-advance signal from play mode
        setSelectedYear((prev) => {
          const idx = mapData.years.indexOf(prev);
          if (idx >= mapData.years.length - 1) {
            setTimeout(() => setIsPlaying(false), 0);
            return prev;
          }
          return mapData.years[idx + 1];
        });
      } else {
        setSelectedYear(year);
      }
    },
    [mapData]
  );

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (mapData) {
        const idx = mapData.years.indexOf(selectedYear);
        if (idx >= mapData.years.length - 1) {
          setSelectedYear(mapData.years[0]);
        }
      }
      setIsPlaying(true);
    }
  }, [isPlaying, mapData, selectedYear]);

  const handleToggleGrade = useCallback((grade: Grade) => {
    setActiveGrades((prev) => {
      const next = new Set(prev);
      if (next.has(grade)) {
        next.delete(grade);
      } else {
        next.add(grade);
      }
      return next;
    });
  }, []);

  const handleAddOfficer = useCallback((officer: MapOfficerEntry) => {
    setSelectedOfficers((prev) => {
      if (prev.some((o) => o.fileNumber === officer.fileNumber)) return prev;
      if (prev.length >= 10) return prev;
      return [...prev, officer];
    });
  }, []);

  const handleRemoveOfficer = useCallback((fileNumber: string) => {
    setSelectedOfficers((prev) =>
      prev.filter((o) => o.fileNumber !== fileNumber)
    );
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedOfficers([]);
  }, []);

  // Compute per-grade counts from filtered data for the current year
  const currentYearCounts = useMemo(() => {
    const counts: Record<Grade, number> = { SP: 0, GI: 0, GII: 0, GIII: 0 };
    if (!filteredMapData) return counts;
    const frame = filteredMapData.frames.find((f) => f.year === selectedYear);
    if (!frame) return counts;
    for (const pt of frame.points) {
      counts[pt.grade]++;
    }
    return counts;
  }, [filteredMapData, selectedYear]);

  // Filtered count for the current year (across all grades)
  const filteredYearCount = useMemo(() => {
    if (!filteredMapData) return 0;
    const frame = filteredMapData.frames.find((f) => f.year === selectedYear);
    return frame?.points.length ?? 0;
  }, [filteredMapData, selectedYear]);

  const highlightedFileNumbers = useMemo(
    () => selectedOfficers.map((o) => o.fileNumber),
    [selectedOfficers]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading map data...</span>
      </div>
    );
  }

  if (error || !mapData || !filteredMapData) {
    return (
      <div className="text-center text-red-600 py-12">
        Failed to load map data: {error || "Unknown error"}
      </div>
    );
  }

  const hasGeoFilter = !!(geoFilter.provinceCode || geoFilter.districtName);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Global Officer Map
          </h2>
          <p className="text-xs text-gray-500">
            {mapData.frames
              .reduce((sum, f) => sum + f.points.length, 0)
              .toLocaleString()}{" "}
            geocoded snapshots across {mapData.years.length} years
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <BoundaryFilter
            geoFilter={geoFilter}
            onFilterChange={setGeoFilter}
            boundaryMeta={boundaryMeta}
            filteredCount={hasGeoFilter ? filteredYearCount : undefined}
          />
          <GradeFilterBar
            activeGrades={activeGrades}
            onToggle={handleToggleGrade}
            counts={currentYearCounts}
          />
        </div>
      </div>

      {/* Map area with picker overlay */}
      <div className="relative">
        <GlobalMobilityMap
          data={filteredMapData}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          activeGrades={activeGrades}
          highlightedOfficers={highlightedFileNumbers}
          geoFilter={geoFilter}
          fullData={hasGeoFilter ? mapData : undefined}
        />
        <OfficerPicker
          selectedOfficers={selectedOfficers}
          onAddOfficer={handleAddOfficer}
          onRemoveOfficer={handleRemoveOfficer}
          onClearAll={handleClearAll}
          selectedYear={selectedYear}
          years={mapData.years}
        />
      </div>

      {/* Footer */}
      {mapData.excludedCount > 0 && (
        <p className="text-xs text-gray-400">
          {mapData.excludedCount.toLocaleString()} snapshots excluded (no
          geocoded coordinates).
        </p>
      )}
    </div>
  );
}
