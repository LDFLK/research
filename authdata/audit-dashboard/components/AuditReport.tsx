'use client';

import { useState } from 'react';
import { AuditReport as AuditReportType, DatasetResult } from '@/lib/types';
import DataViewer from './DataViewer';
import Tooltip, { PHASE_DEFINITIONS } from './Tooltip';

interface Props {
  report: AuditReportType;
}

export default function AuditReport({ report }: Props) {
  const [expandedDataset, setExpandedDataset] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {report.datasets.map((dataset) => {
        const isExpanded = expandedDataset === dataset.dataset_name;

        return (
          <div
            key={dataset.dataset_name}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          >
            {/* Dataset Header */}
            <button
              onClick={() =>
                setExpandedDataset(isExpanded ? null : dataset.dataset_name)
              }
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    dataset.passed
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {dataset.passed ? '✓' : '✗'}
                </span>
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {dataset.dataset_name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <PhaseIndicators dataset={dataset} />
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
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
              <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  {/* Source Discovery */}
                  {dataset.source_discovery && (
                    <div className="space-y-3">
                      <Tooltip content={PHASE_DEFINITIONS.source_discovery}>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              dataset.source_discovery.exists
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          />
                          📁 Source Discovery
                          <span className="text-gray-400 text-xs">ⓘ</span>
                        </h4>
                      </Tooltip>
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Repository:
                          </span>
                          <a
                            href={`https://github.com/${dataset.source_discovery.github_repo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs"
                          >
                            {dataset.source_discovery.github_repo}
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Source File:
                          </span>
                          <a
                            href={`https://github.com/${dataset.source_discovery.github_repo}/blob/main/${encodeURI(dataset.source_discovery.file_path)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline font-mono text-xs inline-flex items-center gap-1"
                          >
                            📄 View on GitHub
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                        {dataset.source_discovery.raw_url && (
                          <div>
                            <a
                              href={dataset.source_discovery.raw_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline text-xs inline-flex items-center gap-1"
                            >
                              📥 View Raw JSON
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Exists:
                          </span>
                          <span
                            className={`ml-2 ${
                              dataset.source_discovery.exists
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {dataset.source_discovery.exists ? 'Yes' : 'No'}
                          </span>
                        </div>
                        {dataset.source_discovery.columns.length > 0 && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Columns:
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {dataset.source_discovery.columns.map((col) => (
                                <span
                                  key={col}
                                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                                >
                                  {col}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {dataset.source_discovery.error && (
                          <div className="text-red-600 dark:text-red-400 text-xs">
                            Error: {dataset.source_discovery.error}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Data Integrity */}
                  {dataset.data_integrity && (
                    <div className="space-y-3">
                      <Tooltip content={PHASE_DEFINITIONS.data_integrity}>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              dataset.data_integrity.accessible &&
                              dataset.data_integrity.valid_json &&
                              dataset.data_integrity.schema_valid
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          />
                          ✅ Data Integrity
                          <span className="text-gray-400 text-xs">ⓘ</span>
                        </h4>
                      </Tooltip>
                      <div className="text-sm space-y-2">
                        <div className="flex gap-4">
                          <span
                            className={
                              dataset.data_integrity.accessible
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {dataset.data_integrity.accessible ? '✓' : '✗'}{' '}
                            Accessible
                          </span>
                          <span
                            className={
                              dataset.data_integrity.valid_json
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {dataset.data_integrity.valid_json ? '✓' : '✗'} Valid
                            JSON
                          </span>
                          <span
                            className={
                              dataset.data_integrity.schema_valid
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {dataset.data_integrity.schema_valid ? '✓' : '✗'}{' '}
                            Schema
                          </span>
                        </div>
                        {dataset.data_integrity.row_count !== undefined && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Rows:
                            </span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {dataset.data_integrity.row_count}
                            </span>
                          </div>
                        )}
                        {dataset.data_integrity.validations.length > 0 && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Validations:
                            </span>
                            <div className="mt-1 space-y-1">
                              {dataset.data_integrity.validations.map((v, i) => (
                                <div
                                  key={i}
                                  className={`text-xs ${
                                    v.passed
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  {v.passed ? '✓' : '✗'} {v.check_name}
                                  {v.error && ` - ${v.error}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {dataset.data_integrity.sample_data.length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                              View sample data
                            </summary>
                            <div className="mt-2">
                              <DataViewer
                                data={dataset.data_integrity.sample_data}
                                maxHeight="200px"
                              />
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  )}

                  {/* App Visibility */}
                  {dataset.app_visibility && (
                    <div className="space-y-3">
                      <Tooltip content={PHASE_DEFINITIONS.app_visibility}>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              dataset.app_visibility.visible
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          />
                          🖥️ App Visibility
                          <span className="text-gray-400 text-xs">ⓘ</span>
                        </h4>
                      </Tooltip>
                      <div className="text-sm space-y-2">
                        {dataset.app_visibility.app_url && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              App URL:
                            </span>
                            <a
                              href={dataset.app_visibility.app_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 dark:text-blue-400 hover:underline text-xs inline-flex items-center gap-1"
                            >
                              🔗 Open in Browser
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}
                        <div className="flex gap-4">
                          <span
                            className={
                              dataset.app_visibility.visible
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }
                          >
                            {dataset.app_visibility.visible ? '✓' : '✗'} Table Visible
                          </span>
                          {dataset.app_visibility.ui_row_count !== undefined && (
                            <span className="text-gray-600 dark:text-gray-300">
                              {dataset.app_visibility.ui_row_count} rows in UI
                            </span>
                          )}
                        </div>
                        {dataset.app_visibility.data_matches_source !== undefined && (
                          <div className="space-y-1">
                            <div>
                              <span
                                className={
                                  dataset.app_visibility.data_matches_source
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }
                              >
                                {dataset.app_visibility.data_matches_source ? '✓' : '✗'}{' '}
                                Data Matches Source
                              </span>
                              {dataset.app_visibility.match_details && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({dataset.app_visibility.match_details.rows_matched || 0} values matched)
                                </span>
                              )}
                            </div>
                            {dataset.app_visibility.match_details?.sample_comparisons && (
                              <details className="mt-1">
                                <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                  View value comparisons
                                </summary>
                                <div className="mt-2 text-xs space-y-2">
                                  {dataset.app_visibility.match_details.sample_comparisons.map((comp: any, i: number) => (
                                    <div key={i} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                      <div className="font-medium mb-1">
                                        Source Row {comp.source_row + 1}:{' '}
                                        <span className={comp.all_matched ? 'text-green-600' : 'text-red-600'}>
                                          {comp.all_matched ? '✓ All matched' : '✗ Some missing'}
                                        </span>
                                      </div>
                                      <div className="space-y-0.5">
                                        {comp.values?.map((v: any, j: number) => (
                                          <div key={j} className="flex items-center gap-2">
                                            <span className={v.found_in_ui ? 'text-green-600' : 'text-red-600'}>
                                              {v.found_in_ui ? '✓' : '✗'}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[200px]" title={v.value}>
                                              {v.value}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </details>
                            )}
                          </div>
                        )}
                        {dataset.app_visibility.navigation_path.length > 0 && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Navigation:
                            </span>
                            <div className="mt-1 space-y-1">
                              {dataset.app_visibility.navigation_path.map(
                                (step, i) => (
                                  <div key={i} className="text-xs text-gray-600 dark:text-gray-300">
                                    {i + 1}. {step}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {Object.keys(dataset.app_visibility.elements_found)
                          .length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                              View elements found
                            </summary>
                            <div className="mt-2">
                              <DataViewer
                                data={dataset.app_visibility.elements_found}
                                maxHeight="200px"
                              />
                            </div>
                          </details>
                        )}
                        {dataset.app_visibility.error && (
                          <div className="text-red-600 dark:text-red-400 text-xs">
                            Error: {dataset.app_visibility.error}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PhaseIndicators({ dataset }: { dataset: DatasetResult }) {
  return (
    <div className="flex gap-2">
      {dataset.source_discovery && (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            dataset.source_discovery.exists
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          Source
        </span>
      )}
      {dataset.data_integrity && (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            dataset.data_integrity.accessible &&
            dataset.data_integrity.valid_json &&
            dataset.data_integrity.schema_valid
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          Integrity
        </span>
      )}
      {dataset.app_visibility && (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            dataset.app_visibility.visible
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          UI
        </span>
      )}
    </div>
  );
}
