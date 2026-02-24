"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import type { GlobalMapData, Grade, GeoFilter } from "@/lib/types";
import {
  fetchProvinceBoundaries,
  fetchDistrictBoundaries,
} from "@/lib/geo-boundaries";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

const SRI_LANKA_CENTER: [number, number] = [7.8, 80.7];

const GRADE_COLORS: Record<Grade, string> = {
  SP: "#9333ea",
  GI: "#075985",
  GII: "#059669",
  GIII: "#d97706",
};

function gradeClusterIcon(grade: Grade) {
  const color = GRADE_COLORS[grade];
  return function (cluster: L.MarkerCluster) {
    const count = cluster.getChildCount();
    const size = count > 100 ? 44 : count > 30 ? 36 : 28;
    return L.divIcon({
      html: `<div style="
        background: ${color};
        color: white;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size > 36 ? 13 : 11}px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">${count}</div>`,
      className: "marker-cluster-grade",
      iconSize: L.point(size, size),
    });
  };
}

export default function GlobalMobilityMap({
  data,
  selectedYear,
  onYearChange,
  isPlaying,
  onPlayPause,
  activeGrades,
  highlightedOfficers,
  geoFilter,
  fullData,
}: {
  data: GlobalMapData;
  selectedYear: number;
  onYearChange: (year: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  activeGrades: Set<Grade>;
  highlightedOfficers?: string[];
  geoFilter?: GeoFilter;
  fullData?: GlobalMapData;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupsRef = useRef<Record<Grade, L.MarkerClusterGroup | null>>({
    SP: null,
    GI: null,
    GII: null,
    GIII: null,
  });
  const trailLinesRef = useRef<L.Polyline[]>([]);
  const boundaryLayersRef = useRef<L.GeoJSON[]>([]);

  const years = data.years;
  const yearIdx = years.indexOf(selectedYear);

  const currentFrame = useMemo(
    () => data.frames.find((f) => f.year === selectedYear),
    [data.frames, selectedYear]
  );

  const highlightedSet = useMemo(
    () => new Set(highlightedOfficers ?? []),
    [highlightedOfficers]
  );

  // Track previous highlighted count to detect additions
  const prevHighlightedCountRef = useRef(0);

  // Use fullData (unfiltered) for trail rendering when a geo filter is active
  const trailFrames = fullData?.frames ?? data.frames;

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(SRI_LANKA_CENTER, 8);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    // Create one MarkerClusterGroup per grade
    const grades: Grade[] = ["SP", "GI", "GII", "GIII"];
    for (const grade of grades) {
      const group = L.markerClusterGroup({
        iconCreateFunction: gradeClusterIcon(grade),
        maxClusterRadius: 40,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        disableClusteringAtZoom: 14,
      });
      map.addLayer(group);
      clusterGroupsRef.current[grade] = group;
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      clusterGroupsRef.current = { SP: null, GI: null, GII: null, GIII: null };
    };
  }, []);

  // Render boundary overlays when geoFilter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing boundary layers
    for (const layer of boundaryLayersRef.current) {
      map.removeLayer(layer);
    }
    boundaryLayersRef.current = [];

    if (!geoFilter?.provinceCode && !geoFilter?.districtName) {
      // No filter — reset to default view
      map.setView(SRI_LANKA_CENTER, 8);
      return;
    }

    if (geoFilter.districtName) {
      // District selected — show district boundary
      fetchDistrictBoundaries().then((fc) => {
        if (mapInstanceRef.current !== map) return; // stale
        const feature = fc.features.find(
          (f) => f.properties?.name === geoFilter.districtName
        );
        if (!feature) return;

        const layer = L.geoJSON(feature, {
          style: {
            color: "#2563eb",
            weight: 2.5,
            fillOpacity: 0.05,
            dashArray: "6 3",
          },
        }).addTo(map);
        boundaryLayersRef.current.push(layer);
        map.fitBounds(layer.getBounds(), { padding: [30, 30] });
      });
    } else if (geoFilter.provinceCode) {
      // Province selected — show province boundary + sub-district lines
      Promise.all([
        fetchProvinceBoundaries(),
        fetchDistrictBoundaries(),
      ]).then(([provFC, distFC]) => {
        if (mapInstanceRef.current !== map) return; // stale

        const provFeature = provFC.features.find(
          (f) => f.properties?.code === geoFilter.provinceCode
        );
        if (!provFeature) return;

        // Province outline
        const provLayer = L.geoJSON(provFeature, {
          style: {
            color: "#7c3aed",
            weight: 2,
            fillOpacity: 0.04,
            dashArray: "8 4",
          },
        }).addTo(map);
        boundaryLayersRef.current.push(provLayer);

        // Sub-district subdivision lines within this province
        const subDistricts = distFC.features.filter(
          (f) => f.properties?.provinceCode === geoFilter.provinceCode
        );
        if (subDistricts.length > 0) {
          const subFC: GeoJSON.FeatureCollection = {
            type: "FeatureCollection",
            features: subDistricts,
          };
          const subLayer = L.geoJSON(subFC, {
            style: {
              color: "#94a3b8",
              weight: 1,
              fillOpacity: 0,
            },
          }).addTo(map);
          boundaryLayersRef.current.push(subLayer);
        }

        map.fitBounds(provLayer.getBounds(), { padding: [30, 30] });
      });
    }
  }, [geoFilter?.provinceCode, geoFilter?.districtName]);

  // Zoom to newly selected officer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentFrame) return;

    const currentCount = highlightedSet.size;
    const prevCount = prevHighlightedCountRef.current;
    prevHighlightedCountRef.current = currentCount;

    // Only zoom when an officer was ADDED (count increased)
    if (currentCount <= prevCount || currentCount === 0) return;

    // The last fileNumber in the set is the newest (insertion order)
    const fileNumbers = [...highlightedSet];
    const newestFN = fileNumbers[fileNumbers.length - 1];

    // Search current frame first
    let pt = currentFrame.points.find((p) => p.fileNumber === newestFN);
    if (!pt) {
      // Officer might not be in current year — find their latest known position
      for (let i = trailFrames.length - 1; i >= 0; i--) {
        if (trailFrames[i].year > selectedYear) continue;
        pt = trailFrames[i].points.find((p) => p.fileNumber === newestFN);
        if (pt) break;
      }
    }

    if (pt) {
      map.setView([pt.lat, pt.lng], 12, { animate: true });
    }
  }, [highlightedSet, currentFrame, trailFrames, selectedYear]);

  // Render markers when year, grades, or highlights change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentFrame) return;

    const grades: Grade[] = ["SP", "GI", "GII", "GIII"];

    // Clear all cluster groups
    for (const grade of grades) {
      clusterGroupsRef.current[grade]?.clearLayers();
    }

    // Clear trail lines
    for (const line of trailLinesRef.current) map.removeLayer(line);
    trailLinesRef.current = [];

    // Add markers for visible grades
    for (const point of currentFrame.points) {
      if (!activeGrades.has(point.grade)) continue;

      const group = clusterGroupsRef.current[point.grade];
      if (!group) continue;

      const isHighlighted = highlightedSet.has(point.fileNumber);
      const color = GRADE_COLORS[point.grade];
      const size = isHighlighted ? 14 : 8;
      const pulse = isHighlighted
        ? "animation: global-pulse 2s infinite;"
        : "";

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${isHighlighted ? "2px solid white" : "1px solid white"};
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          ${pulse}
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([point.lat, point.lng], { icon });
      marker.bindPopup(
        `<div style="font-size:13px;min-width:180px">
          <strong>${point.name}</strong><br/>
          <span style="color:#666">File: ${point.fileNumber}</span><br/>
          <span style="color:${color};font-weight:bold">${point.grade}</span>
          ${point.post ? ` — ${point.post}` : ""}<br/>
          <span style="color:#666">${point.institution}</span><br/>
          ${point.district ? `<span style="color:#888">${point.district}</span><br/>` : ""}
          <a href="/officers/${point.fileNumber}" style="color:#2563eb;text-decoration:underline;font-size:12px">View profile →</a>
        </div>`
      );
      group.addLayer(marker);
    }

    // Draw trail polylines for highlighted officers (using unfiltered data)
    if (highlightedSet.size > 0) {
      for (const fileNumber of highlightedSet) {
        const trail: [number, number][] = [];
        let grade: Grade = "GIII";

        for (const frame of trailFrames) {
          if (frame.year > selectedYear) break;
          const pt = frame.points.find((p) => p.fileNumber === fileNumber);
          if (pt) {
            trail.push([pt.lat, pt.lng]);
            grade = pt.grade;
          }
        }

        if (trail.length >= 2) {
          const line = L.polyline(trail, {
            color: GRADE_COLORS[grade],
            weight: 3,
            opacity: 0.7,
            dashArray: "6 4",
          }).addTo(map);
          trailLinesRef.current.push(line);
        }
      }
    }
  }, [currentFrame, activeGrades, highlightedSet, selectedYear, trailFrames]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = setInterval(() => {
      onYearChange(-1); // signal "advance" — handled by parent
    }, 2000);

    return () => clearInterval(intervalId);
  }, [isPlaying, onYearChange]);

  const handlePrev = useCallback(() => {
    if (yearIdx > 0) onYearChange(years[yearIdx - 1]);
  }, [yearIdx, years, onYearChange]);

  const handleNext = useCallback(() => {
    if (yearIdx < years.length - 1) onYearChange(years[yearIdx + 1]);
  }, [yearIdx, years, onYearChange]);

  if (years.length === 0) return null;

  return (
    <div className="space-y-3">
      <style>{`@keyframes global-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); } 50% { box-shadow: 0 0 0 8px rgba(37,99,235,0); } }`}</style>

      {/* Year control bar */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={yearIdx === 0}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous year"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={onPlayPause}
            className="p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            title={isPlaying ? "Pause" : "Play animation"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleNext}
            disabled={yearIdx === years.length - 1}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next year"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={years.length - 1}
          value={yearIdx}
          onChange={(e) => {
            onYearChange(years[parseInt(e.target.value)]);
          }}
          className="flex-1 h-2 accent-blue-600"
        />

        <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-center">
          {selectedYear}
        </span>
      </div>

      {/* Map */}
      <div ref={mapRef} className="h-[600px] rounded-lg border border-gray-200" />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {(["SP", "GI", "GII", "GIII"] as Grade[])
          .filter((g) => activeGrades.has(g))
          .map((g) => (
            <span key={g} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: GRADE_COLORS[g] }}
              />
              {g}
            </span>
          ))}
        {highlightedSet.size > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-gray-400 inline-block" />
            Selected officer trail
          </span>
        )}
      </div>
    </div>
  );
}
