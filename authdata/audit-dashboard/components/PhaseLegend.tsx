'use client';

import { useState } from 'react';

const PHASES = [
  {
    id: 'source_discovery',
    name: 'Source Discovery',
    icon: '📁',
    color: 'blue',
    description: 'Verifies dataset existence in GitHub repository',
    checks: [
      'File exists in repository',
      'File is accessible (HTTP 200)',
      'Basic JSON structure valid',
    ],
  },
  {
    id: 'data_integrity',
    name: 'Data Integrity',
    icon: '✅',
    color: 'green',
    description: 'Validates data quality from source',
    checks: [
      'JSON structure is valid',
      'Expected columns present',
      'Minimum row count met',
      'Values not empty',
      'Numeric columns valid',
    ],
  },
  {
    id: 'app_visibility',
    name: 'App Visibility',
    icon: '🖥️',
    color: 'purple',
    description: 'Verifies data appears correctly in UI',
    checks: [
      'Navigation path works',
      'Data table is visible',
      'Row count matches source',
      'Data values match source',
    ],
  },
];

export default function PhaseLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          📖 Phase Definitions
        </span>
        <span className="text-gray-400">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {PHASES.map((phase) => (
              <div
                key={phase.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{phase.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {phase.name}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {phase.description}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  <div className="font-medium mb-1">Validates:</div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {phase.checks.map((check, i) => (
                      <li key={i}>{check}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
