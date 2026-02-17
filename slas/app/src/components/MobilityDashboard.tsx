"use client";

import type { MobilityStats } from "@/lib/types";
import { ArrowRightLeft, Ruler, TrendingUp, AlertTriangle } from "lucide-react";

export default function MobilityDashboard({
  stats,
}: {
  stats: MobilityStats;
}) {
  const maxBucketCount = Math.max(
    ...stats.distanceHistogram.map((b) => b.count),
    1
  );

  const summaryCards = [
    {
      icon: ArrowRightLeft,
      label: "Officers Transferred",
      value: stats.totalOfficersWithTransfers.toLocaleString(),
    },
    {
      icon: TrendingUp,
      label: "Avg Transfers / Officer",
      value: stats.avgTransfersPerOfficer.toFixed(1),
    },
    {
      icon: Ruler,
      label: "Avg Distance / Transfer",
      value: `${stats.avgDistancePerTransfer} km`,
    },
    {
      icon: AlertTriangle,
      label: "Long-Distance (>100 km)",
      value: stats.longDistanceTransfers.toLocaleString(),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-200 rounded-lg p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Distance Histogram */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Transfer Distance Distribution
        </h2>
        <div className="space-y-3">
          {stats.distanceHistogram.map((bucket) => {
            const pct = (bucket.count / maxBucketCount) * 100;
            let barColor = "bg-green-500";
            if (bucket.bucket.includes("50-100")) barColor = "bg-amber-500";
            else if (
              bucket.bucket.includes("100-200") ||
              bucket.bucket.includes("200+")
            )
              barColor = "bg-red-500";
            else if (bucket.bucket.includes("25-50")) barColor = "bg-lime-500";
            else if (bucket.bucket.includes("10-25"))
              barColor = "bg-emerald-500";

            return (
              <div key={bucket.bucket} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-24 text-right flex-shrink-0">
                  {bucket.bucket}
                </span>
                <div className="flex-1 h-7 bg-gray-100 rounded overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded transition-all`}
                    style={{ width: `${Math.max(pct, 1)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-16">
                  {bucket.count.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Long-Distance Routes */}
      {stats.topLongDistanceRoutes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Most Common Long-Distance Routes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-2 font-medium text-gray-500">From</th>
                  <th className="pb-2 font-medium text-gray-500">To</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">
                    Transfers
                  </th>
                  <th className="pb-2 font-medium text-gray-500 text-right">
                    Avg Distance
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topLongDistanceRoutes.map((route, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 pr-4">{route.from}</td>
                    <td className="py-2 pr-4">{route.to}</td>
                    <td className="py-2 text-right font-medium">
                      {route.count}
                    </td>
                    <td className="py-2 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-medium">
                        {route.avgDistKm} km
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
