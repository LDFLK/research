import { getDashboardStats } from "@/lib/db";
import type { Grade } from "@/lib/types";
import Link from "next/link";
import { Users, Building2, Calendar, TrendingUp } from "lucide-react";

const GRADE_COLORS: Record<Grade, string> = {
  SP: "text-purple-600",
  GI: "text-sky-800",
  GII: "text-emerald-600",
  GIII: "text-amber-600",
};

const GRADE_BG: Record<Grade, string> = {
  SP: "bg-purple-50",
  GI: "bg-sky-50",
  GII: "bg-emerald-50",
  GIII: "bg-amber-50",
};

export default function DashboardPage() {
  const stats = getDashboardStats();
  const grades: Grade[] = ["SP", "GI", "GII", "GIII"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          SLAS officer tracking across {stats.years[0]}–
          {stats.years[stats.years.length - 1]}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/officers"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-sky-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-50 rounded-lg">
              <Users className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.totalOfficers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Unique Officers</p>
            </div>
          </div>
        </Link>
        <Link
          href="/institutions"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-sky-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.totalInstitutions.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Institutions</p>
            </div>
          </div>
        </Link>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {stats.totalSnapshots.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Yearly Snapshots ({stats.years.length} years)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Current Grade Distribution
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.gradeDistribution.map((g) => (
            <div
              key={g.grade}
              className={`${GRADE_BG[g.grade]} rounded-lg p-4 text-center`}
            >
              <p className={`text-2xl font-bold ${GRADE_COLORS[g.grade]}`}>
                {g.count}
              </p>
              <p className="text-sm text-gray-600">{g.grade}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Yearly Breakdown Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Officers Per Year</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Year
                </th>
                {grades.map((g) => (
                  <th
                    key={g}
                    className={`text-right py-2 px-3 font-medium ${GRADE_COLORS[g]}`}
                  >
                    {g}
                  </th>
                ))}
                <th className="text-right py-2 px-3 font-medium text-gray-900">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.years.map((year) => {
                const yearData = stats.yearlyBreakdown.filter(
                  (r) => r.year === year
                );
                const total = yearData.reduce((s, r) => s + r.count, 0);
                return (
                  <tr key={year} className="border-b border-gray-100">
                    <td className="py-2 px-3 font-mono font-medium">
                      {year}
                    </td>
                    {grades.map((g) => {
                      const entry = yearData.find((r) => r.grade === g);
                      return (
                        <td key={g} className="text-right py-2 px-3">
                          {entry ? entry.count.toLocaleString() : "—"}
                        </td>
                      );
                    })}
                    <td className="text-right py-2 px-3 font-semibold">
                      {total.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
