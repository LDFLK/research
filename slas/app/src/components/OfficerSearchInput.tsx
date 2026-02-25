"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MapOfficerEntry } from "@/lib/types";
import GradeBadge from "./GradeBadge";
import { Search, X, Users, User } from "lucide-react";

const MAX_SELECTED = 10;

export default function OfficerSearchInput({
  onSelectOfficer,
  selectedOfficers,
  multiMode,
  onToggleMultiMode,
  onRemoveOfficer,
  onClearAll,
}: {
  onSelectOfficer: (officer: MapOfficerEntry) => void;
  selectedOfficers: MapOfficerEntry[];
  multiMode: boolean;
  onToggleMultiMode: () => void;
  onRemoveOfficer: (fileNumber: string) => void;
  onClearAll: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapOfficerEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const handleSelect = (officer: MapOfficerEntry) => {
    onSelectOfficer(officer);
    setQuery("");
    setResults([]);
    if (!multiMode) {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search input row */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (query.length >= 2) setShowDropdown(true);
            }}
            placeholder="Track officer..."
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-52"
          />
        </div>

        {/* Multi-mode toggle */}
        <button
          onClick={onToggleMultiMode}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition ${
            multiMode
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
          }`}
          title={multiMode ? "Switch to single officer mode" : "Enable multi-officer tracking"}
        >
          {multiMode ? <Users className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
          Multi
        </button>
      </div>

      {/* Selected officer chips (multi-mode) */}
      {multiMode && selectedOfficers.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
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

      {/* Dropdown results */}
      {showDropdown && query.length >= 2 && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-[1000] max-h-72 overflow-y-auto">
          {isSearching && (
            <p className="text-xs text-gray-400 px-3 py-2">Searching...</p>
          )}
          {!isSearching && results.length === 0 && (
            <p className="text-xs text-gray-400 px-3 py-2">No results found</p>
          )}
          {results.map((officer) => {
            const isSelected = selectedSet.has(officer.fileNumber);
            const isDisabled =
              isSelected || selectedOfficers.length >= MAX_SELECTED;
            return (
              <button
                key={officer.fileNumber}
                disabled={isDisabled}
                onClick={() => handleSelect(officer)}
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
      )}
    </div>
  );
}
