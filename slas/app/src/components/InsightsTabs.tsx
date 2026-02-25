"use client";

import { useState } from "react";
import type { TransferFrequencyStats, InsightsSummary } from "@/lib/types";
import TransferFrequencyPanel from "./TransferFrequencyPanel";
import GradeDistributionPanel from "./GradeDistributionPanel";
import CoServicePanel from "./CoServicePanel";
import { Network, PieChart, ArrowLeftRight } from "lucide-react";

type Tab = "bonds" | "grades" | "transfers";

const TABS: { id: Tab; label: string; icon: typeof Network }[] = [
  { id: "bonds", label: "Co-Service Bonds", icon: Network },
  { id: "grades", label: "Grade Mix", icon: PieChart },
  { id: "transfers", label: "Transfer Frequency", icon: ArrowLeftRight },
];

export default function InsightsTabs({
  summary,
  transferStats,
}: {
  summary: InsightsSummary;
  transferStats: TransferFrequencyStats;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("bonds");

  return (
    <div className="space-y-6">
      {/* Summary header cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <span className="text-sm text-gray-500">Multi-Officer Institutions</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary.multiOfficerInstitutions.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <span className="text-sm text-gray-500">Stationary Officers</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary.stationaryOfficers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <span className="text-sm text-gray-500">Frequent Movers (4+)</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary.frequentMovers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <span className="text-sm text-gray-500">Avg Tenure / Posting</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {summary.avgTenure} yrs
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "bonds" && <CoServicePanel />}
      {activeTab === "grades" && <GradeDistributionPanel />}
      {activeTab === "transfers" && <TransferFrequencyPanel stats={transferStats} />}
    </div>
  );
}
