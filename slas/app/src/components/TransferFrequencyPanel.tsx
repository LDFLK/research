"use client";

import Link from "next/link";
import type { TransferFrequencyStats } from "@/lib/types";
import { Users, Anchor, Zap, Clock } from "lucide-react";

const GRADE_BADGE: Record<string, string> = {
  SP: "bg-purple-100 text-purple-700",
  GI: "bg-blue-100 text-blue-700",
  GII: "bg-emerald-100 text-emerald-700",
  GIII: "bg-amber-100 text-amber-700",
};

export default function TransferFrequencyPanel({
  stats,
}: {
  stats: TransferFrequencyStats;
}) {
  const maxHistCount = Math.max(...stats.histogram.map((h) => h.count), 1);

  const summaryCards = [
    {
      icon: Users,
      label: "Total Officers",
      value: stats.totalOfficers.toLocaleString(),
    },
    {
      icon: Anchor,
      label: "Stationary (1 institution)",
      value: stats.stationaryCount.toLocaleString(),
    },
    {
      icon: Zap,
      label: "Frequent Movers (4+)",
      value: stats.frequentMoverCount.toLocaleString(),
    },
    {
      icon: Clock,
      label: "Avg Tenure / Posting",
      value: `${stats.avgTenurePerPosting} yrs`,
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

      {/* Histogram */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Institution Count Distribution
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          How many distinct institutions has each officer served at?
        </p>
        <div className="space-y-3">
          {stats.histogram.map((bucket) => {
            const pct = (bucket.count / maxHistCount) * 100;
            let barColor = "bg-emerald-500";
            if (bucket.distinctInstitutions === 2) barColor = "bg-sky-500";
            else if (bucket.distinctInstitutions === 3) barColor = "bg-amber-500";
            else if (bucket.distinctInstitutions >= 4) barColor = "bg-red-500";

            return (
              <div
                key={bucket.distinctInstitutions}
                className="flex items-center gap-3"
              >
                <span className="text-sm text-gray-600 w-28 text-right flex-shrink-0">
                  {bucket.distinctInstitutions}{" "}
                  {bucket.distinctInstitutions === 1
                    ? "institution"
                    : "institutions"}
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

      {/* Two-column tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Stationary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Most Stationary Officers</h2>
          <p className="text-sm text-gray-500 mb-4">
            Officers at 1 institution across the most years
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-2 font-medium text-gray-500">Name</th>
                  <th className="pb-2 font-medium text-gray-500">Grade</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">
                    Years
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topStationary.map((officer) => (
                  <tr
                    key={officer.fileNumber}
                    className="border-b border-gray-100"
                  >
                    <td className="py-2 pr-4">
                      <Link
                        href={`/officers/${encodeURIComponent(officer.fileNumber)}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {officer.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${GRADE_BADGE[officer.currentGrade] || ""}`}
                      >
                        {officer.currentGrade}
                      </span>
                    </td>
                    <td className="py-2 text-right font-medium">
                      {officer.yearsTracked}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Frequent Movers */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Most Frequent Movers</h2>
          <p className="text-sm text-gray-500 mb-4">
            Officers who served at 4+ distinct institutions
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-2 font-medium text-gray-500">Name</th>
                  <th className="pb-2 font-medium text-gray-500">Grade</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">
                    Institutions
                  </th>
                  <th className="pb-2 font-medium text-gray-500 text-right">
                    Avg Tenure
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topMovers.map((officer) => (
                  <tr
                    key={officer.fileNumber}
                    className="border-b border-gray-100"
                  >
                    <td className="py-2 pr-4">
                      <Link
                        href={`/officers/${encodeURIComponent(officer.fileNumber)}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {officer.name}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${GRADE_BADGE[officer.currentGrade] || ""}`}
                      >
                        {officer.currentGrade}
                      </span>
                    </td>
                    <td className="py-2 text-right font-medium">
                      {officer.distinctInstitutions}
                    </td>
                    <td className="py-2 text-right text-gray-600">
                      {officer.avgTenure} yrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
