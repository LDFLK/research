'use client';

import Tooltip, { PHASE_DEFINITIONS } from './Tooltip';

interface PhaseInfoProps {
  phases: string[];
}

const PHASE_ICONS: Record<string, string> = {
  source_discovery: '📁',
  data_integrity: '✅',
  app_visibility: '🖥️',
};

const PHASE_LABELS: Record<string, string> = {
  source_discovery: 'Source Discovery',
  data_integrity: 'Data Integrity',
  app_visibility: 'App Visibility',
};

export default function PhaseInfo({ phases }: PhaseInfoProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {phases.map((phase) => (
        <Tooltip
          key={phase}
          content={PHASE_DEFINITIONS[phase as keyof typeof PHASE_DEFINITIONS] || 'Unknown phase'}
        >
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            <span>{PHASE_ICONS[phase] || '•'}</span>
            <span>{PHASE_LABELS[phase] || phase}</span>
            <span className="ml-1 text-gray-400 dark:text-gray-500">ⓘ</span>
          </span>
        </Tooltip>
      ))}
    </div>
  );
}
