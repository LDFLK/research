"use client";

import React from "react";
import {
  Search,
  FileText,
  GitBranch,
  Clock,
  Play,
  History,
  Trash2,
  Layers,
  Compass,
  StopCircle,
} from "lucide-react";
import { QueryParams, QueryType, RelationshipDirection, QueryHistoryItem } from "@/lib/types";
import { getQueryTypeLabel, getQueryTypeDescription } from "@/lib/api";

interface QueryPanelProps {
  params: QueryParams;
  onParamsChange: (params: Partial<QueryParams>) => void;
  onExecute: () => void;
  onCancel: () => void;
  isLoading: boolean;
  validationError: string | null;
  history: QueryHistoryItem[];
  onHistorySelect: (item: QueryHistoryItem) => void;
  onClearHistory: () => void;
}

const queryTypes: { type: QueryType; icon: React.ReactNode }[] = [
  { type: "search", icon: <Search className="w-4 h-4" /> },
  { type: "metadata", icon: <FileText className="w-4 h-4" /> },
  { type: "attributes", icon: <Layers className="w-4 h-4" /> },
  { type: "relations", icon: <GitBranch className="w-4 h-4" /> },
  { type: "explore", icon: <Compass className="w-4 h-4" /> },
];

export default function QueryPanel({
  params,
  onParamsChange,
  onExecute,
  onCancel,
  isLoading,
  validationError,
  history,
  onHistorySelect,
  onClearHistory,
}: QueryPanelProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecute();
  };

  return (
    <div className="h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Query Type Selection */}
        <div>
          <label className="section-title">Query Type</label>
          <div className="space-y-1">
            {queryTypes.map(({ type, icon }) => (
              <label
                key={type}
                className={`radio-option ${
                  params.queryType === type ? "bg-zinc-800 ring-1 ring-blue-500" : ""
                }`}
              >
                <input
                  type="radio"
                  name="queryType"
                  value={type}
                  checked={params.queryType === type}
                  onChange={() => onParamsChange({ queryType: type })}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    params.queryType === type
                      ? "border-blue-500 bg-blue-500"
                      : "border-zinc-600"
                  }`}
                >
                  {params.queryType === type && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                {icon}
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {getQueryTypeLabel(type)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {getQueryTypeDescription(type)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Search Parameters */}
        {params.queryType === "search" && (
          <div className="space-y-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <label className="section-title">Search Criteria</label>
            <p className="text-xs text-zinc-500 -mt-1">
              Search by Entity ID, Kind, Name, or any combination
            </p>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Entity ID</label>
              <input
                type="text"
                value={params.entityId || ""}
                onChange={(e) => onParamsChange({ entityId: e.target.value || undefined })}
                placeholder="Search by exact ID..."
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Kind (Major)</label>
              <input
                type="text"
                value={params.kindMajor || ""}
                onChange={(e) => onParamsChange({ kindMajor: e.target.value || undefined })}
                placeholder="e.g., Person, Organisation..."
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Kind (Minor)</label>
              <input
                type="text"
                value={params.kindMinor || ""}
                onChange={(e) => onParamsChange({ kindMinor: e.target.value || undefined })}
                placeholder="Optional minor kind..."
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Name (partial match)</label>
              <input
                type="text"
                value={params.entityName || ""}
                onChange={(e) => onParamsChange({ entityName: e.target.value || undefined })}
                placeholder="Filter by name..."
                className="input-field"
              />
            </div>
          </div>
        )}

        {/* Explore - Entity ID required */}
        {params.queryType === "explore" && (
          <div className="space-y-4">
            <div>
              <label className="section-title flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Entity ID
              </label>
              <input
                type="text"
                value={params.entityId || ""}
                onChange={(e) => onParamsChange({ entityId: e.target.value || undefined })}
                placeholder="Enter entity ID to explore..."
                className="input-field"
                required
              />
              <p className="text-xs text-zinc-500 mt-2">
                Discovers all attributes by traversing the category hierarchy
              </p>
            </div>
          </div>
        )}

        {/* Metadata/Relations - Entity ID required */}
        {(params.queryType === "metadata" || params.queryType === "relations") && (
          <div>
            <label className="section-title flex items-center gap-2">
              <Search className="w-4 h-4" />
              Entity ID
            </label>
            <input
              type="text"
              value={params.entityId || ""}
              onChange={(e) => onParamsChange({ entityId: e.target.value || undefined })}
              placeholder="Enter entity ID..."
              className="input-field"
              required
            />
          </div>
        )}

        {/* Attributes - Entity ID + Attribute Name required */}
        {params.queryType === "attributes" && (
          <div className="space-y-4">
            <div>
              <label className="section-title flex items-center gap-2">
                <Search className="w-4 h-4" />
                Entity ID
              </label>
              <input
                type="text"
                value={params.entityId || ""}
                onChange={(e) => onParamsChange({ entityId: e.target.value || undefined })}
                placeholder="Enter entity ID..."
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="section-title flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Attribute Name
              </label>
              <input
                type="text"
                value={params.attributeName || ""}
                onChange={(e) => onParamsChange({ attributeName: e.target.value || undefined })}
                placeholder="Enter attribute name..."
                className="input-field"
                required
              />
            </div>

            <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700 space-y-4">
              <label className="section-title">Time Range (optional)</label>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Start Time</label>
                <input
                  type="datetime-local"
                  value={params.startTime || ""}
                  onChange={(e) => onParamsChange({ startTime: e.target.value || undefined })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">End Time</label>
                <input
                  type="datetime-local"
                  value={params.endTime || ""}
                  onChange={(e) => onParamsChange({ endTime: e.target.value || undefined })}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Relations Filters */}
        {params.queryType === "relations" && (
          <div className="space-y-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <label className="section-title">Relation Filters (optional)</label>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Direction</label>
              <select
                value={params.direction || ""}
                onChange={(e) =>
                  onParamsChange({
                    direction: (e.target.value as RelationshipDirection) || undefined,
                  })
                }
                className="input-field"
              >
                <option value="">All directions</option>
                <option value="OUTGOING">Outgoing</option>
                <option value="INCOMING">Incoming</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Relation Name</label>
              <input
                type="text"
                value={params.relationName || ""}
                onChange={(e) => onParamsChange({ relationName: e.target.value || undefined })}
                placeholder="Filter by relation name..."
                className="input-field"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Related Entity ID</label>
              <input
                type="text"
                value={params.relatedEntityId || ""}
                onChange={(e) =>
                  onParamsChange({ relatedEntityId: e.target.value || undefined })
                }
                placeholder="Filter by related entity..."
                className="input-field"
              />
            </div>

            <div className="border-t border-zinc-700 pt-4">
              <label className="section-title flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Filters
              </label>
              <p className="text-xs text-zinc-500 mb-3">
                Use either Active At OR Start/End Time
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Active At</label>
                  <input
                    type="datetime-local"
                    value={params.activeAt || ""}
                    onChange={(e) => onParamsChange({
                      activeAt: e.target.value || undefined,
                      startTime: undefined,
                      endTime: undefined,
                    })}
                    className="input-field"
                    disabled={!!params.startTime || !!params.endTime}
                  />
                </div>

                <div className="text-xs text-zinc-500 text-center">— OR —</div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Start Time</label>
                  <input
                    type="datetime-local"
                    value={params.startTime || ""}
                    onChange={(e) => onParamsChange({
                      startTime: e.target.value || undefined,
                      activeAt: undefined,
                    })}
                    className="input-field"
                    disabled={!!params.activeAt}
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">End Time</label>
                  <input
                    type="datetime-local"
                    value={params.endTime || ""}
                    onChange={(e) => onParamsChange({
                      endTime: e.target.value || undefined,
                      activeAt: undefined,
                    })}
                    className="input-field"
                    disabled={!!params.activeAt}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {validationError}
          </div>
        )}

        {/* Execute/Cancel Buttons */}
        {isLoading ? (
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <StopCircle className="w-4 h-4" />
            Cancel
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary w-full"
          >
            <Play className="w-4 h-4" />
            Execute Query
          </button>
        )}
      </form>

      {/* Query History */}
      {history.length > 0 && (
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="section-title flex items-center gap-2 mb-0">
              <History className="w-4 h-4" />
              Recent Queries
            </label>
            <button
              onClick={onClearHistory}
              className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {history.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => onHistorySelect(item)}
                className="w-full text-left p-2 text-xs bg-zinc-800/50 hover:bg-zinc-800 rounded transition-colors truncate"
              >
                <span className="text-blue-400">{getQueryTypeLabel(item.params.queryType)}</span>
                <span className="text-zinc-500 ml-2">{item.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
