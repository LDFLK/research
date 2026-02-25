"use client";

import { useState, useEffect, useCallback } from "react";
import type { GradeBalanceEntry } from "@/lib/types";

const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  SP: { bg: "bg-purple-500", text: "text-purple-700" },
  GI: { bg: "bg-blue-500", text: "text-blue-700" },
  GII: { bg: "bg-emerald-500", text: "text-emerald-700" },
  GIII: { bg: "bg-amber-500", text: "text-amber-700" },
};

export default function GradeDistributionPanel() {
  const [year, setYear] = useState(2025);
  const [ranking, setRanking] = useState<GradeBalanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [history, setHistory] = useState<GradeBalanceEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchRanking = useCallback(async (y: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/insights/grade-distribution?year=${y}&ranking=true`);
      const data = await res.json();
      setRanking(data.ranking || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRanking(year);
  }, [year, fetchRanking]);

  const handleInstitutionClick = async (institutionId: string) => {
    if (selectedInstitution === institutionId) {
      setSelectedInstitution(null);
      setHistory([]);
      return;
    }
    setSelectedInstitution(institutionId);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/insights/grade-distribution?institutionId=${encodeURIComponent(institutionId)}`);
      const data = await res.json();
      setHistory(data.history || []);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Year selector */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {YEARS.map((y) => (
          <button
            key={y}
            onClick={() => { setYear(y); setSelectedInstitution(null); setHistory([]); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              year === y
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        {Object.entries(GRADE_COLORS).map(([grade, colors]) => (
          <div key={grade} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${colors.bg}`} />
            <span className={`font-medium ${colors.text}`}>{grade}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading grade distribution...</div>
      ) : (
        <>
          {/* Ranking table with stacked bars */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-1">
              Institution Grade Composition — {year}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Institutions with 3+ officers, sorted by total headcount. Click a row for year-over-year detail.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 font-medium text-gray-500">Institution</th>
                    <th className="pb-2 font-medium text-gray-500 text-right w-12">SP</th>
                    <th className="pb-2 font-medium text-gray-500 text-right w-12">GI</th>
                    <th className="pb-2 font-medium text-gray-500 text-right w-12">GII</th>
                    <th className="pb-2 font-medium text-gray-500 text-right w-12">GIII</th>
                    <th className="pb-2 font-medium text-gray-500 text-right w-14">Total</th>
                    <th className="pb-2 font-medium text-gray-500 text-right w-20">Senior%</th>
                    <th className="pb-2 font-medium text-gray-500 w-48">Grade Mix</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((entry) => (
                    <tr
                      key={entry.institutionId}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedInstitution === entry.institutionId ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleInstitutionClick(entry.institutionId)}
                    >
                      <td className="py-2 pr-4 max-w-xs truncate" title={entry.institutionName}>
                        {entry.institutionName}
                      </td>
                      <td className="py-2 text-right">{entry.sp || "—"}</td>
                      <td className="py-2 text-right">{entry.gi || "—"}</td>
                      <td className="py-2 text-right">{entry.gii || "—"}</td>
                      <td className="py-2 text-right">{entry.giii || "—"}</td>
                      <td className="py-2 text-right font-medium">{entry.total}</td>
                      <td className="py-2 text-right">
                        {Math.round(entry.seniorRatio * 100)}%
                      </td>
                      <td className="py-2">
                        <StackedBar entry={entry} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Year-over-year detail for selected institution */}
          {selectedInstitution && (
            <div className="bg-white border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-1">
                Year-over-Year — {history[0]?.institutionName || ""}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Grade composition across all tracked years
              </p>
              {historyLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No data</div>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.year} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-12 text-right flex-shrink-0 font-medium">
                        {entry.year}
                      </span>
                      <div className="flex-1">
                        <StackedBar entry={entry} />
                      </div>
                      <span className="text-sm text-gray-500 w-20 text-right">
                        {entry.total} officers
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StackedBar({ entry }: { entry: GradeBalanceEntry }) {
  const total = entry.total;
  if (total === 0) return null;

  const segments = [
    { grade: "SP", count: entry.sp },
    { grade: "GI", count: entry.gi },
    { grade: "GII", count: entry.gii },
    { grade: "GIII", count: entry.giii },
  ].filter((s) => s.count > 0);

  return (
    <div className="flex h-6 rounded overflow-hidden bg-gray-100">
      {segments.map((seg) => {
        const pct = (seg.count / total) * 100;
        const colors = GRADE_COLORS[seg.grade];
        return (
          <div
            key={seg.grade}
            className={`${colors.bg} flex items-center justify-center text-white text-xs font-medium`}
            style={{ width: `${pct}%`, minWidth: pct > 8 ? undefined : "0" }}
            title={`${seg.grade}: ${seg.count}`}
          >
            {pct >= 12 ? seg.count : ""}
          </div>
        );
      })}
    </div>
  );
}
