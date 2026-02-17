"use client";

import Link from "next/link";
import type { Officer } from "@/lib/types";
import GradeBadge from "./GradeBadge";
import { User, Briefcase, Building2 } from "lucide-react";

export default function OfficerCard({ officer }: { officer: Officer }) {
  return (
    <Link
      href={`/officers/${encodeURIComponent(officer.fileNumber)}`}
      className="block border border-gray-200 rounded-lg p-4 hover:border-sky-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-900 truncate">
              {officer.name}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">{officer.fileNumber}</p>
          {officer.currentPost && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{officer.currentPost}</span>
            </div>
          )}
          {officer.currentWorkplace && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{officer.currentWorkplace}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <GradeBadge grade={officer.currentGrade} />
          <span className="text-xs text-gray-400">
            {officer.firstSeenYear}–{officer.lastSeenYear}
          </span>
        </div>
      </div>
    </Link>
  );
}
