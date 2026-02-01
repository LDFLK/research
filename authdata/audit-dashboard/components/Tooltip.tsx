'use client';

import { useState, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </span>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-normal w-64 z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </span>
  );
}

// Phase definitions for tooltips
export const PHASE_DEFINITIONS = {
  source_discovery: "Verifies that the dataset file exists in the GitHub repository. Checks file accessibility and basic structure.",
  data_integrity: "Validates the actual data from GitHub: JSON structure, expected columns, data quality rules (min rows, non-empty values, numeric checks).",
  app_visibility: "Uses browser automation to verify the data is visible in the UI and matches the source data from GitHub.",
};

// Term definitions for tooltips
export const TERM_DEFINITIONS = {
  datasets_passed: "Number of datasets where all validation checks passed across all phases.",
  datasets_failed: "Number of datasets with at least one failed validation check.",
  actions: "Individual operations performed during the audit: HTTP requests, browser navigations, data validations.",
  successful_actions: "Operations that completed without errors.",
  failed_actions: "Operations that encountered errors or validation failures.",
};
