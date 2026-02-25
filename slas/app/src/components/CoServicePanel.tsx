"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import type { InstitutionCoService, Grade } from "@/lib/types";
import { Search, Users, Link2, Shield, Minus } from "lucide-react";
import GradeFilterBar from "@/components/GradeFilterBar";

const CoServiceGraph = dynamic(() => import("@/components/CoServiceGraph"), {
  ssr: false,
  loading: () => (
    <div className="h-[450px] bg-gray-50 rounded-lg animate-pulse flex items-center justify-center text-gray-400">
      Loading graph...
    </div>
  ),
});

interface TopInstitution {
  institutionId: string;
  institutionName: string;
  officerCount: number;
}

const ALL_GRADES: Grade[] = ["SP", "GI", "GII", "GIII"];

export default function CoServicePanel() {
  const [institutions, setInstitutions] = useState<TopInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coService, setCoService] = useState<InstitutionCoService | null>(null);
  const [bondLoading, setBondLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeGrades, setActiveGrades] = useState<Set<Grade>>(
    () => new Set(ALL_GRADES)
  );

  useEffect(() => {
    fetch("/api/insights/co-service")
      .then((r) => r.json())
      .then((data) => setInstitutions(data.institutions || []))
      .finally(() => setLoading(false));
  }, []);

  const selectInstitution = async (id: string) => {
    if (selectedId === id) return;
    setSelectedId(id);
    setBondLoading(true);
    try {
      const res = await fetch(
        `/api/insights/co-service?institutionId=${encodeURIComponent(id)}`
      );
      const data: InstitutionCoService = await res.json();
      setCoService(data);
    } finally {
      setBondLoading(false);
    }
  };

  const handleOfficerClick = useCallback((fileNumber: string) => {
    window.open(`/officers/${encodeURIComponent(fileNumber)}`, "_blank");
  }, []);

  const handleToggleGrade = useCallback((grade: Grade) => {
    setActiveGrades((prev) => {
      const next = new Set(prev);
      if (next.has(grade)) {
        if (next.size > 1) next.delete(grade);
      } else {
        next.add(grade);
      }
      return next;
    });
  }, []);

  // Grade counts from bonds for the filter bar
  const gradeCounts = useMemo(() => {
    const counts: Record<Grade, number> = { SP: 0, GI: 0, GII: 0, GIII: 0 };
    if (!coService) return counts;
    const seen = new Set<string>();
    for (const bond of coService.bonds) {
      if (!seen.has(bond.officer1FileNumber)) {
        seen.add(bond.officer1FileNumber);
        counts[bond.officer1Grade]++;
      }
      if (!seen.has(bond.officer2FileNumber)) {
        seen.add(bond.officer2FileNumber);
        counts[bond.officer2Grade]++;
      }
    }
    return counts;
  }, [coService]);

  const filtered = search
    ? institutions.filter((i) =>
        i.institutionName.toLowerCase().includes(search.toLowerCase())
      )
    : institutions;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {coService && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-500">
                Strong Bonds (3+ yrs)
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {coService.strongCount}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="h-5 w-5 text-sky-400" />
              <span className="text-sm text-gray-500">Moderate (2 yrs)</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {coService.moderateCount}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <Minus className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Weak (1 yr)</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {coService.weakCount}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Total Officers</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {coService.totalOfficers}
            </p>
          </div>
        </div>
      )}

      {/* Grade filter bar (visible when an institution is selected) */}
      {coService && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">
            Filter by grade:
          </span>
          <GradeFilterBar
            activeGrades={activeGrades}
            onToggle={handleToggleGrade}
            counts={gradeCounts}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Institution picker */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Select Institution</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search institutions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filtered.map((inst) => (
                <button
                  key={inst.institutionId}
                  onClick={() => selectInstitution(inst.institutionId)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedId === inst.institutionId
                      ? "bg-blue-50 text-blue-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="truncate">{inst.institutionName}</div>
                  <div className="text-xs text-gray-400">
                    {inst.officerCount} officers
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No matching institutions
                </div>
              )}
            </div>
          )}
        </div>

        {/* Graph area */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-1">
            {coService
              ? `Co-Service Network — ${coService.institutionName}`
              : "Co-Service Network"}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {coService
              ? `${coService.totalOfficers} officers, ${coService.bonds.length} bonds. Drag nodes to rearrange, scroll to zoom, click to open profile.`
              : "Select an institution to visualize officer co-service bonds"}
          </p>

          {!selectedId ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Choose an institution from the left panel</p>
            </div>
          ) : bondLoading ? (
            <div className="text-center py-16 text-gray-500">
              Loading network...
            </div>
          ) : coService ? (
            <CoServiceGraph
              coService={coService}
              activeGrades={activeGrades}
              onOfficerClick={handleOfficerClick}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
