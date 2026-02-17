import { getInstitution } from "@/lib/db";
import { notFound } from "next/navigation";
import GradeBadge from "@/components/GradeBadge";
import Link from "next/link";
import { ArrowLeft, Users, Building2 } from "lucide-react";
import type { Grade } from "@/lib/types";

export default function InstitutionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = decodeURIComponent(params.id);
  const data = getInstitution(id);

  if (!data) notFound();

  const { institution, officersByYear } = data;
  const latestYear = officersByYear[0];

  return (
    <div className="space-y-8">
      <Link
        href="/institutions"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Institutions
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Building2 className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {institution.name}
            </h1>
            {institution.kindMinor && (
              <p className="text-gray-500 mt-1 capitalize">
                {institution.kindMinor.replace(/-/g, " ")}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex gap-6 text-sm">
          <div>
            <p className="text-gray-500">Years Tracked</p>
            <p className="font-medium">
              {officersByYear.length > 0
                ? `${officersByYear[officersByYear.length - 1].year}–${officersByYear[0].year}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Current Officers</p>
            <p className="font-medium">
              {latestYear ? latestYear.officers.length : 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500">All-Time Officers</p>
            <p className="font-medium">
              {new Set(
                officersByYear.flatMap((y) =>
                  y.officers.map((o) => o.fileNumber)
                )
              ).size}
            </p>
          </div>
        </div>
      </div>

      {/* Year-by-year roster */}
      {officersByYear.map(({ year, officers }) => {
        const gradeGroups = new Map<Grade, typeof officers>();
        for (const o of officers) {
          if (!gradeGroups.has(o.grade)) gradeGroups.set(o.grade, []);
          gradeGroups.get(o.grade)!.push(o);
        }

        return (
          <div
            key={year}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold font-mono">{year}</h2>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Users className="h-4 w-4" />
                {officers.length} officer{officers.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-4">
              {(["SP", "GI", "GII", "GIII"] as Grade[]).map((g) => {
                const group = gradeGroups.get(g);
                if (!group) return null;
                return (
                  <div key={g}>
                    <div className="flex items-center gap-2 mb-2">
                      <GradeBadge grade={g} />
                      <span className="text-xs text-gray-400">
                        ({group.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {group.map((o) => (
                        <Link
                          key={o.fileNumber}
                          href={`/officers/${encodeURIComponent(o.fileNumber)}`}
                          className="text-sm border border-gray-100 rounded px-3 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <p className="font-medium text-gray-900 truncate">
                            {o.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {o.post}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
