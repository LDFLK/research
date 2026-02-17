"use client";

import { useState, useEffect, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { Building2, Users, ChevronLeft, ChevronRight } from "lucide-react";

interface InstitutionRow {
  id: string;
  name: string;
  kindMajor: string;
  kindMinor: string;
  officerCount: number;
}

const TYPES = [
  { value: "", label: "All Types" },
  { value: "ministry", label: "Ministry" },
  { value: "department", label: "Department" },
  { value: "divisional-secretariat", label: "Divisional Secretariat" },
  { value: "district-secretariat", label: "District Secretariat" },
  { value: "provincial", label: "Provincial" },
  { value: "secretariat", label: "Secretariat" },
  { value: "commission", label: "Commission" },
  { value: "statutory-body", label: "Statutory Body" },
  { value: "municipal", label: "Municipal" },
];

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type) params.set("type", type);
    params.set("page", String(page));
    params.set("limit", String(limit));

    const res = await fetch(`/api/institutions?${params}`);
    const data = await res.json();
    setInstitutions(data.institutions);
    setTotal(data.total);
  }, [query, type, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Institutions</h1>

      <div className="space-y-4">
        <SearchBar
          placeholder="Search institutions..."
          onSearch={(q) => {
            setQuery(q);
            setPage(1);
          }}
        />
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setType(t.value);
                setPage(1);
              }}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                type === t.value
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        {total.toLocaleString()} institution{total !== 1 ? "s" : ""} found
      </p>

      <div className="space-y-2">
        {institutions.map((inst) => (
          <Link
            key={inst.id}
            href={`/institutions/${encodeURIComponent(inst.id)}`}
            className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:border-sky-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {inst.name}
                </p>
                {inst.kindMinor && (
                  <p className="text-xs text-gray-500 capitalize">
                    {inst.kindMinor.replace(/-/g, " ")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0 ml-4">
              <Users className="h-4 w-4" />
              {inst.officerCount}
            </div>
          </Link>
        ))}
      </div>

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
