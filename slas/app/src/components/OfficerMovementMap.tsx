"use client";

import { useEffect, useRef } from "react";
import type { OfficerMobility } from "@/lib/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const SRI_LANKA_CENTER: [number, number] = [7.8, 80.7];

function getTransferColor(distanceKm: number | null): string {
  if (distanceKm == null) return "#9ca3af";
  if (distanceKm < 50) return "#22c55e";
  if (distanceKm <= 100) return "#f59e0b";
  return "#ef4444";
}

export default function OfficerMovementMap({
  mobility,
}: {
  mobility: OfficerMobility;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(SRI_LANKA_CENTER, 8);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    const bounds = L.latLngBounds([]);

    // Add numbered markers for each location
    mobility.locations.forEach((loc, idx) => {
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          background: #1e40af;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">${idx + 1}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
      marker.bindPopup(
        `<div style="font-size:13px">
          <strong>${loc.name}</strong><br/>
          <span style="color:#666">Years: ${loc.years.join(", ")}</span><br/>
          <span style="color:#666">Grade: ${loc.grade}</span>
        </div>`
      );
      bounds.extend([loc.lat, loc.lng]);
    });

    // Draw polylines between consecutive transfers
    for (const t of mobility.transfers) {
      if (t.fromLat == null || t.fromLng == null || t.toLat == null || t.toLng == null)
        continue;

      const color = getTransferColor(t.distanceKm);
      const line = L.polyline(
        [
          [t.fromLat, t.fromLng],
          [t.toLat, t.toLng],
        ],
        {
          color,
          weight: 3,
          opacity: 0.7,
          dashArray: t.distanceKm != null && t.distanceKm > 100 ? undefined : "6 4",
        }
      ).addTo(map);

      line.bindPopup(
        `<div style="font-size:13px">
          <strong>${t.fromInstitution}</strong><br/>
          → <strong>${t.toInstitution}</strong><br/>
          <span style="color:#666">${t.fromYear} → ${t.toYear}</span><br/>
          ${t.distanceKm != null ? `<span style="color:${color};font-weight:bold">${t.distanceKm} km</span>` : ""}
        </div>`
      );
    }

    // Fit bounds if we have markers
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mobility]);

  return (
    <div>
      <div ref={mapRef} className="h-[400px] rounded-lg border border-gray-200" />
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-green-500 inline-block" /> &lt;50 km
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-amber-500 inline-block" /> 50–100 km
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-red-500 inline-block" /> &gt;100 km
        </span>
      </div>
    </div>
  );
}
