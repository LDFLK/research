'use client';

import { useState } from 'react';
import { Action } from '@/lib/types';
import DataViewer from './DataViewer';

interface Props {
  actions: Action[];
}

const ACTION_TYPE_COLORS: Record<string, string> = {
  http_fetch: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  selenium_navigate: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  selenium_click: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  selenium_extract: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  selenium_wait: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  validation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const PHASE_COLORS: Record<string, string> = {
  source_discovery: 'border-l-green-500',
  app_visibility: 'border-l-purple-500',
  data_integrity: 'border-l-blue-500',
};

export default function ActionTimeline({ actions }: Props) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const phases = Array.from(new Set(actions.map((a) => a.phase)));
  const filteredActions = filter === 'all'
    ? actions
    : actions.filter((a) => a.phase === filter);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All ({actions.length})
        </button>
        {phases.map((phase) => {
          const count = actions.filter((a) => a.phase === phase).length;
          return (
            <button
              key={phase}
              onClick={() => setFilter(phase)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === phase
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {phase.replace(/_/g, ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {filteredActions.map((action) => {
          const isExpanded = expandedAction === action.id;
          const phaseColor = PHASE_COLORS[action.phase] || 'border-l-gray-500';
          const typeColor = ACTION_TYPE_COLORS[action.action_type] || 'bg-gray-100 text-gray-800';

          return (
            <div
              key={action.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 ${phaseColor} overflow-hidden`}
            >
              {/* Action Header */}
              <button
                onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-400">
                    {action.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}
                  >
                    {action.action_type}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-md">
                    {action.target?.url || action.target?.selector || 'No target'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {action.duration_ms}ms
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      action.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    {/* Left Column: Meta & Target */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Metadata
                        </h4>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-gray-500">Timestamp:</span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {action.timestamp}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Phase:</span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {action.phase}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>{' '}
                            <span className="text-gray-900 dark:text-white">
                              {action.duration_ms}ms
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>{' '}
                            <span
                              className={
                                action.status === 'success'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }
                            >
                              {action.status}
                            </span>
                          </div>
                          {action.error && (
                            <div>
                              <span className="text-gray-500">Error:</span>{' '}
                              <span className="text-red-600 dark:text-red-400">
                                {action.error}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {action.target && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Target
                          </h4>
                          <DataViewer data={action.target} maxHeight="150px" />
                        </div>
                      )}

                      {action.extraction && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Extraction
                          </h4>
                          <DataViewer data={action.extraction} maxHeight="200px" />
                        </div>
                      )}
                    </div>

                    {/* Right Column: Request & Response */}
                    <div className="space-y-4">
                      {action.request && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Request
                          </h4>
                          <DataViewer data={action.request} maxHeight="150px" />
                        </div>
                      )}

                      {action.response && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Response
                          </h4>
                          <DataViewer
                            data={{
                              status_code: action.response.status_code,
                              body_size: action.response.body_size,
                              body_preview: action.response.body_preview,
                            }}
                            maxHeight="200px"
                          />
                          {action.response.body_full && (
                            <details className="mt-2">
                              <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                View full response body
                              </summary>
                              <DataViewer
                                data={action.response.body_full}
                                maxHeight="400px"
                              />
                            </details>
                          )}
                        </div>
                      )}

                      {action.metadata && Object.keys(action.metadata).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Additional Metadata
                          </h4>
                          <DataViewer data={action.metadata} maxHeight="150px" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
