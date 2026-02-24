"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { MobilityStats } from "@/lib/types";
import MobilityDashboard from "./MobilityDashboard";
import { Globe, BarChart3 } from "lucide-react";

const GlobalMobilityPage = dynamic(() => import("./GlobalMobilityPage"), {
  ssr: false,
});

type Tab = "map" | "dashboard";

const TABS: { id: Tab; label: string; icon: typeof Globe }[] = [
  { id: "map", label: "Global Map", icon: Globe },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function MobilityTabs({ stats }: { stats: MobilityStats }) {
  const [activeTab, setActiveTab] = useState<Tab>("map");

  return (
    <div className="space-y-6">
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
      {activeTab === "map" ? (
        <GlobalMobilityPage />
      ) : (
        <MobilityDashboard stats={stats} />
      )}
    </div>
  );
}
