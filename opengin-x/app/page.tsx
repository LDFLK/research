"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Database } from "lucide-react";
import QueryPanel from "@/components/QueryPanel";
import ResultsPanel from "@/components/ResultsPanel";
import ApiLogPanel from "@/components/ApiLogPanel";
import { QueryParams, ApiResponse, QueryHistoryItem, ExploreResult } from "@/lib/types";
import { executeQuery, validateParams, getQueryTypeLabel, exploreEntity } from "@/lib/api";

const HISTORY_KEY = "opengin-explorer-history";
const MAX_HISTORY = 10;

const defaultParams: QueryParams = {
  queryType: "search",
};

function getQueryDescription(params: QueryParams): string {
  switch (params.queryType) {
    case "search":
      if (params.entityId) return `ID: ${params.entityId}`;
      if (params.kindMajor) return `Kind: ${params.kindMajor}`;
      return "Search";
    case "metadata":
      return params.entityId || "Metadata";
    case "attributes":
      return `${params.entityId || "?"} / ${params.attributeName || "?"}`;
    case "relations":
      return params.entityId || "Relations";
    case "explore":
      return params.entityId || "Explore";
  }
}

export default function Home() {
  const [params, setParams] = useState<QueryParams>(defaultParams);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [exploreResult, setExploreResult] = useState<ExploreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        localStorage.removeItem(HISTORY_KEY);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: QueryHistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  }, []);

  const handleParamsChange = (updates: Partial<QueryParams>) => {
    setParams((prev) => ({ ...prev, ...updates }));
    setValidationError(null);
  };

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const handleExecute = async () => {
    const error = validateParams(params);
    if (error) {
      setValidationError(error);
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setValidationError(null);

    try {
      // Handle explore mode separately
      if (params.queryType === "explore") {
        setResponse(null);
        const result = await exploreEntity(params.entityId || "", signal);
        if (!signal.aborted) {
          setExploreResult(result);
        }
      } else {
        setExploreResult(null);
        const result = await executeQuery(params);
        if (!signal.aborted) {
          setResponse(result);
        }
      }

      // Add to history (only if not cancelled)
      if (!signal.aborted) {
        const historyItem: QueryHistoryItem = {
          id: Date.now().toString(),
          params: { ...params },
          timestamp: Date.now(),
          description: getQueryDescription(params),
        };

        const newHistory = [
          historyItem,
          ...history.filter(
            (h) =>
              h.params.queryType !== params.queryType ||
              getQueryDescription(h.params) !== getQueryDescription(params)
          ),
        ].slice(0, MAX_HISTORY);

        saveHistory(newHistory);
      }
    } catch (error) {
      if (signal.aborted) {
        // Request was cancelled, do nothing
        return;
      }
      if (params.queryType === "explore") {
        setExploreResult({
          entityId: params.entityId || "",
          categories: [],
          error: error instanceof Error ? error.message : "An error occurred",
        });
      } else {
        setResponse({
          data: null,
          status: 500,
          endpoint: "",
          method: "GET",
          error: error instanceof Error ? error.message : "An error occurred",
        });
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
      abortControllerRef.current = null;
    }
  };

  const handleHistorySelect = (item: QueryHistoryItem) => {
    setParams(item.params);
    setValidationError(null);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Database className="w-6 h-6" />
            <h1 className="text-xl font-bold text-white">OpenGIN Explorer</h1>
          </div>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
            Read API
          </span>
          <span className="text-xs text-zinc-600 ml-auto">
            {params.queryType && (
              <span className="text-zinc-400">
                Mode: {getQueryTypeLabel(params.queryType)}
              </span>
            )}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex max-w-screen-2xl mx-auto w-full">
          {/* Query Panel */}
          <aside className="w-96 border-r border-zinc-800 bg-zinc-900/30 flex-shrink-0">
            <QueryPanel
              params={params}
              onParamsChange={handleParamsChange}
              onExecute={handleExecute}
              onCancel={handleCancel}
              isLoading={isLoading}
              validationError={validationError}
              history={history}
              onHistorySelect={handleHistorySelect}
              onClearHistory={handleClearHistory}
            />
          </aside>

          {/* Results Panel */}
          <section className="flex-1 bg-zinc-950">
            <ResultsPanel
              response={response}
              isLoading={isLoading}
              exploreResult={exploreResult}
              isExploreMode={params.queryType === "explore"}
            />
          </section>
        </div>

        {/* API Log Panel - Bottom Drawer */}
        <ApiLogPanel />
      </main>
    </div>
  );
}
