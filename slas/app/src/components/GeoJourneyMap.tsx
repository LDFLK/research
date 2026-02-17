"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { GeoProfile } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Play, Pause, SkipBack, SkipForward, Layers } from "lucide-react";

const SRI_LANKA_CENTER: [number, number] = [7.8, 80.7];

function getTransferColor(distanceKm: number | null): string {
  if (distanceKm == null) return "#9ca3af";
  if (distanceKm < 50) return "#22c55e";
  if (distanceKm <= 100) return "#f59e0b";
  return "#ef4444";
}

export default function GeoJourneyMap({
  geoProfile,
}: {
  geoProfile: GeoProfile;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);

  const allYears = useMemo(
    () =>
      Array.from(
        new Set(geoProfile.postings.flatMap((p) => p.years))
      ).sort((a, b) => a - b),
    [geoProfile.postings]
  );

  const [selectedYear, setSelectedYear] = useState(() => allYears[allYears.length - 1] ?? 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Keep a ref to allYears so the interval callback always has fresh data
  const allYearsRef = useRef(allYears);
  allYearsRef.current = allYears;

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(SRI_LANKA_CENTER, 8);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Clear and redraw markers/lines based on year or showAll
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing
    for (const layer of markersRef.current) map.removeLayer(layer);
    for (const line of polylinesRef.current) map.removeLayer(line);
    markersRef.current = [];
    polylinesRef.current = [];

    const bounds = L.latLngBounds([]);
    const postings = geoProfile.postings;
    const visiblePostings = showAll
      ? postings
      : postings.filter((p) => p.years.some((y) => y <= selectedYear));

    // Draw polylines between consecutive visible postings
    for (let i = 1; i < visiblePostings.length; i++) {
      const prev = visiblePostings[i - 1];
      const cur = visiblePostings[i];
      if (prev.lat == null || prev.lng == null || cur.lat == null || cur.lng == null) continue;

      // In year mode, only draw line if the transfer has happened by selectedYear
      if (!showAll) {
        const transferYear = cur.years[0];
        if (transferYear > selectedYear) continue;
      }

      const color = getTransferColor(cur.distanceFromPrevKm);
      const line = L.polyline(
        [
          [prev.lat, prev.lng],
          [cur.lat, cur.lng],
        ],
        {
          color,
          weight: 3,
          opacity: 0.5,
          dashArray: cur.distanceFromPrevKm != null && cur.distanceFromPrevKm > 100 ? undefined : "6 4",
        }
      ).addTo(map);

      line.bindPopup(
        `<div style="font-size:13px">
          <strong>${prev.institution}</strong><br/>
          → <strong>${cur.institution}</strong><br/>
          ${cur.distanceFromPrevKm != null ? `<span style="color:${color};font-weight:bold">${cur.distanceFromPrevKm} km</span>` : ""}
        </div>`
      );

      polylinesRef.current.push(line);
    }

    // Draw markers
    visiblePostings.forEach((posting) => {
      if (posting.lat == null || posting.lng == null) return;

      const isCurrent = !showAll && posting.years.includes(selectedYear);
      const isPast = !showAll && !isCurrent;

      const size = isCurrent ? 32 : isPast ? 22 : 26;
      const bg = isCurrent ? "#2563eb" : isPast ? "#9ca3af" : "#1e40af";
      const border = isCurrent ? "3px solid #bfdbfe" : "2px solid white";
      const pulse = isCurrent
        ? "animation: geo-pulse 2s infinite;"
        : "";

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background: ${bg};
          color: white;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isCurrent ? 13 : 11}px;
          font-weight: bold;
          border: ${border};
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ${pulse}
        ">${posting.years[0]}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([posting.lat, posting.lng], { icon }).addTo(map);

      const yearRange =
        posting.years.length === 1
          ? `${posting.years[0]}`
          : `${posting.years[0]}–${posting.years[posting.years.length - 1]}`;

      marker.bindPopup(
        `<div style="font-size:13px;min-width:180px">
          <strong>${posting.institution}</strong><br/>
          ${posting.locationName ? `<span style="color:#666">${posting.locationName}${posting.district ? `, ${posting.district}` : ""}</span><br/>` : ""}
          <span style="color:#666">Years: ${yearRange} (${posting.durationYears}y)</span><br/>
          <span style="color:#666">Grade: ${posting.grades.join(", ")}</span><br/>
          ${posting.posts.length > 0 ? `<span style="color:#666">Post: ${posting.posts.join(", ")}</span><br/>` : ""}
          ${posting.distanceFromPrevKm != null ? `<span style="color:#888">↗ ${posting.distanceFromPrevKm} km from previous</span>` : ""}
        </div>`
      );

      bounds.extend([posting.lat, posting.lng]);
      markersRef.current.push(marker);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [selectedYear, showAll, geoProfile.postings]);

  // Play mode — use a stable ref for allYears to avoid dependency churn
  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = setInterval(() => {
      const years = allYearsRef.current;
      setSelectedYear((prev) => {
        const idx = years.indexOf(prev);
        if (idx >= years.length - 1) {
          // Reached end — stop playing (scheduled outside updater)
          setTimeout(() => setIsPlaying(false), 0);
          return prev;
        }
        return years[idx + 1];
      });
    }, 1500);

    return () => clearInterval(intervalId);
  }, [isPlaying]);

  const selectedYearIdx = allYears.indexOf(selectedYear);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      // If at the end, restart from beginning
      if (selectedYearIdx >= allYears.length - 1) {
        setSelectedYear(allYears[0]);
      }
      setShowAll(false);
      setIsPlaying(true);
    }
  }, [isPlaying, selectedYearIdx, allYears]);

  const handlePrev = useCallback(() => {
    if (selectedYearIdx > 0) setSelectedYear(allYears[selectedYearIdx - 1]);
  }, [selectedYearIdx, allYears]);

  const handleNext = useCallback(() => {
    if (selectedYearIdx < allYears.length - 1) setSelectedYear(allYears[selectedYearIdx + 1]);
  }, [selectedYearIdx, allYears]);

  if (allYears.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Inject pulse keyframes once */}
      <style>{`@keyframes geo-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); } 50% { box-shadow: 0 0 0 10px rgba(37,99,235,0); } }`}</style>

      {/* Year control bar */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            disabled={showAll || selectedYearIdx === 0}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous year"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={handlePlayPause}
            disabled={showAll}
            className="p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
            title={isPlaying ? "Pause" : "Play career journey"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={handleNext}
            disabled={showAll || selectedYearIdx === allYears.length - 1}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next year"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={allYears.length - 1}
          value={selectedYearIdx}
          onChange={(e) => {
            setShowAll(false);
            setIsPlaying(false);
            setSelectedYear(allYears[parseInt(e.target.value)]);
          }}
          disabled={showAll}
          className="flex-1 h-2 accent-blue-600 disabled:opacity-30"
        />

        <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-center">
          {showAll ? "All" : selectedYear}
        </span>

        <button
          onClick={() => {
            setShowAll(!showAll);
            setIsPlaying(false);
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${
            showAll
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
          title="Show all locations at once"
        >
          <Layers className="h-3 w-3" />
          All
        </button>
      </div>

      {/* Map */}
      <div ref={mapRef} className="h-[450px] rounded-lg border border-gray-200" />

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-green-500 inline-block" /> &lt;50 km
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-amber-500 inline-block" /> 50–100 km
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-red-500 inline-block" /> &gt;100 km
        </span>
        {!showAll && (
          <>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Current
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /> Past
            </span>
          </>
        )}
      </div>
    </div>
  );
}
