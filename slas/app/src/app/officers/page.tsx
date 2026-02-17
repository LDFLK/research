"use client";

import { useState, useEffect, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import OfficerCard from "@/components/OfficerCard";
import YearFilter from "@/components/YearFilter";
import type { Officer, Grade } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GRADES: Grade[] = ["SP", "GI", "GII", "GIII"];
const YEARS = [2021, 2022, 2023, 2024, 2025, 2026];

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState<Grade | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchOfficers = useCallback(async () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (grade) params.set("grade", grade);
    if (year) params.set("year", String(year));
    params.set("page", String(page));
    params.set("limit", String(limit));

    const res = await fetch(`/api/officers?${params}`);
    const data = await res.json();
    setOfficers(data.officers);
    setTotal(data.total);
  }, [query, grade, year, page]);

  useEffect(() => {
    fetchOfficers();
  }, [fetchOfficers]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Officers</h1>

      <div className="space-y-4">
        <SearchBar
          placeholder="Search by name or file number..."
          onSearch={(q) => {
            setQuery(q);
            setPage(1);
          }}
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setGrade(null);
                setPage(1);
              }}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                grade === null
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              All Grades
            </button>
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGrade(g === grade ? null : g);
                  setPage(1);
                }}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  grade === g
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <YearFilter
            years={YEARS}
            selected={year}
            onChange={(y) => {
              setYear(y);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        {total.toLocaleString()} officer{total !== 1 ? "s" : ""} found
        {query && ` for "${query}"`}
      </p>

      {/* Officer list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {officers.map((officer) => (
          <OfficerCard key={officer.fileNumber} officer={officer} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md disabled:opacity-40 hover:bg-gray-100"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
