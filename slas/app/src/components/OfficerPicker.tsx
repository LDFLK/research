"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { MapOfficerEntry } from "@/lib/types";
import GradeBadge from "./GradeBadge";
import { User, X, Search, ChevronRight, ChevronLeft, Calendar } from "lucide-react";

const MAX_SELECTED = 10;

export default function OfficerPicker({
  selectedOfficers,
  onAddOfficer,
  onRemoveOfficer,
  onClearAll,
  selectedYear,
  years,
}: {
  selectedOfficers: MapOfficerEntry[];
  onAddOfficer: (officer: MapOfficerEntry) => void;
  onRemoveOfficer: (fileNumber: string) => void;
  onClearAll: () => void;
  selectedYear?: number;
  years?: number[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapOfficerEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync filterYear with parent's selectedYear on mount / when it changes
  useEffect(() => {
    if (selectedYear) setFilterYear(selectedYear);
  }, [selectedYear]);

  const selectedSet = new Set(selectedOfficers.map((o) => o.fileNumber));

  const doSearch = useCallback((q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    fetch(`/api/mobility/map/officers?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data) => setResults(data.officers ?? []))
      .catch(() => setResults([]))
      .finally(() => setIsSearching(false));
  }, []);

  const filteredResults = useMemo(
    () =>
      filterYear
        ? results.filter(
            (o) => o.firstSeenYear <= filterYear && o.lastSeenYear >= filterYear
          )
        : results,
    [results, filterYear]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-3 right-3 z-[1000] bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"
      >
        <User className="h-4 w-4" />
        Track Officers
        {selectedOfficers.length > 0 && (
          <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {selectedOfficers.length}
          </span>
        )}
        <ChevronLeft className="h-3 w-3" />
      </button>
    );
  }

  return (
    <div className="absolute top-3 right-3 z-[1000] bg-white border border-gray-200 rounded-lg shadow-lg w-80 max-h-[560px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-700">
          Track Officers
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronRight className="h-4 w-4 text-gray-500" />
        </button>
      </div>

      {/* Selected chips */}
      {selectedOfficers.length > 0 && (
        <div className="px-3 py-2 border-b border-gray-100 flex flex-wrap gap-1.5">
          {selectedOfficers.map((o) => (
            <span
              key={o.fileNumber}
              className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
            >
              {o.name.split(" ").slice(0, 2).join(" ")}
              <button
                onClick={() => onRemoveOfficer(o.fileNumber)}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={onClearAll}
            className="text-xs text-gray-400 hover:text-red-500 px-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search input + year filter */}
      <div className="px-3 py-2 border-b border-gray-100 space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or file #..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {years && years.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <select
              value={filterYear ?? ""}
              onChange={(e) =>
                setFilterYear(e.target.value ? Number(e.target.value) : null)
              }
              className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
        {selectedOfficers.length >= MAX_SELECTED && (
          <p className="text-xs text-amber-600">
            Max {MAX_SELECTED} officers selected
          </p>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <p className="text-xs text-gray-400 px-3 py-2">Searching...</p>
        )}
        {!isSearching && query.length >= 2 && filteredResults.length === 0 && (
          <p className="text-xs text-gray-400 px-3 py-2">No results found</p>
        )}
        {filteredResults.map((officer) => {
          const isSelected = selectedSet.has(officer.fileNumber);
          return (
            <button
              key={officer.fileNumber}
              disabled={isSelected || selectedOfficers.length >= MAX_SELECTED}
              onClick={() => onAddOfficer(officer)}
              className={`w-full text-left px-3 py-2 border-b border-gray-50 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800 truncate">
                  {officer.name}
                </span>
                <GradeBadge grade={officer.currentGrade} />
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {officer.fileNumber} &middot; {officer.firstSeenYear}–
                {officer.lastSeenYear}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
