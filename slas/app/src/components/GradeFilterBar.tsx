"use client";

import type { Grade } from "@/lib/types";

const GRADES: { grade: Grade; label: string; color: string; activeClass: string; inactiveClass: string }[] = [
  {
    grade: "SP",
    label: "SP",
    color: "#9333ea",
    activeClass: "bg-purple-600 text-white border-purple-600",
    inactiveClass: "bg-white text-purple-600 border-purple-300 hover:border-purple-500",
  },
  {
    grade: "GI",
    label: "GI",
    color: "#075985",
    activeClass: "bg-sky-800 text-white border-sky-800",
    inactiveClass: "bg-white text-sky-800 border-sky-300 hover:border-sky-500",
  },
  {
    grade: "GII",
    label: "GII",
    color: "#059669",
    activeClass: "bg-emerald-600 text-white border-emerald-600",
    inactiveClass: "bg-white text-emerald-600 border-emerald-300 hover:border-emerald-500",
  },
  {
    grade: "GIII",
    label: "GIII",
    color: "#d97706",
    activeClass: "bg-amber-600 text-white border-amber-600",
    inactiveClass: "bg-white text-amber-600 border-amber-300 hover:border-amber-500",
  },
];

export default function GradeFilterBar({
  activeGrades,
  onToggle,
  counts,
}: {
  activeGrades: Set<Grade>;
  onToggle: (grade: Grade) => void;
  counts?: Record<Grade, number>;
}) {
  return (
    <div className="flex items-center gap-2">
      {GRADES.map(({ grade, label, activeClass, inactiveClass }) => {
        const isActive = activeGrades.has(grade);
        const count = counts?.[grade];
        return (
          <button
            key={grade}
            onClick={() => onToggle(grade)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg border-2 transition-colors flex items-center gap-1.5 ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            {label}
            {count != null && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                {count.toLocaleString()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
