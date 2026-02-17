"use client";

import type { Grade } from "@/lib/types";

const GRADE_COLORS: Record<Grade, string> = {
  SP: "bg-purple-600 text-white",
  GI: "bg-sky-800 text-white",
  GII: "bg-emerald-600 text-white",
  GIII: "bg-amber-600 text-white",
};

const GRADE_LABELS: Record<Grade, string> = {
  SP: "Special Grade",
  GI: "Grade I",
  GII: "Grade II",
  GIII: "Grade III",
};

export default function GradeBadge({
  grade,
  size = "sm",
}: {
  grade: Grade;
  size?: "sm" | "md";
}) {
  const cls =
    size === "md"
      ? "px-3 py-1 text-sm font-semibold rounded-md"
      : "px-2 py-0.5 text-xs font-medium rounded";
  return (
    <span className={`inline-block ${cls} ${GRADE_COLORS[grade]}`}>
      {size === "md" ? GRADE_LABELS[grade] : grade}
    </span>
  );
}
