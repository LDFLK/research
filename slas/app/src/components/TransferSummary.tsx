"use client";

import type { OfficerMobility } from "@/lib/types";
import { ArrowRightLeft, Ruler, TrendingUp, MapPin } from "lucide-react";

export default function TransferSummary({
  mobility,
}: {
  mobility: OfficerMobility;
}) {
  const stats = [
    {
      icon: ArrowRightLeft,
      label: "Transfers",
      value: mobility.totalTransfers,
    },
    {
      icon: Ruler,
      label: "Total Distance",
      value: `${mobility.totalDistanceKm} km`,
    },
    {
      icon: TrendingUp,
      label: "Avg Distance",
      value: `${mobility.avgDistanceKm} km`,
    },
    {
      icon: MapPin,
      label: "Longest Transfer",
      value: `${mobility.maxDistanceKm} km`,
      sub: mobility.maxTransferDesc,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-gray-50 rounded-lg p-4 flex items-start gap-3"
        >
          <s.icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-semibold text-gray-900">{s.value}</p>
            {s.sub && (
              <p className="text-xs text-gray-400 truncate" title={s.sub}>
                {s.sub}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
