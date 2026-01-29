"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { ChevronDown, ChevronRight, Copy, Check, Trash2, Terminal } from "lucide-react";
import { ApiCallLog } from "@/lib/curl";
import { getApiCalls, subscribeToApiCalls, clearApiCalls } from "@/lib/apiCallStore";

interface ApiCallRowProps {
  call: ApiCallLog;
}

function ApiCallRow({ call }: ApiCallRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(call.curl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = call.curl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isSuccess = call.status !== undefined && call.status >= 200 && call.status < 300;
  const isError = call.status !== undefined && (call.status >= 400 || call.error);
  const isPending = call.status === undefined && !call.error;

  // Extract path from URL for display
  const urlPath = (() => {
    try {
      const url = new URL(call.url);
      return url.pathname + url.search;
    } catch {
      return call.url;
    }
  })();

  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      <div
        className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-800/50 cursor-pointer text-sm"
        onClick={() => setExpanded(!expanded)}
      >
        <button className="text-zinc-500 hover:text-zinc-300">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <span
          className={`font-mono text-xs px-1.5 py-0.5 rounded ${
            call.method === "POST"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-green-500/20 text-green-400"
          }`}
        >
          {call.method}
        </span>

        <span className="font-mono text-zinc-300 truncate flex-1" title={call.url}>
          {urlPath}
        </span>

        {isPending ? (
          <span className="text-zinc-500 text-xs animate-pulse">...</span>
        ) : (
          <span
            className={`text-xs font-mono ${
              isError ? "text-red-400" : isSuccess ? "text-green-400" : "text-zinc-400"
            }`}
          >
            {call.status}
          </span>
        )}

        {call.duration !== undefined && (
          <span className="text-zinc-500 text-xs w-12 text-right">
            {call.duration}ms
          </span>
        )}

        <button
          onClick={handleCopy}
          className="text-zinc-500 hover:text-zinc-300 p-1"
          title="Copy cURL command"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-1">
          <pre className="bg-zinc-900 rounded p-3 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap break-all">
            {call.curl}
          </pre>
          {call.error && (
            <p className="mt-2 text-xs text-red-400">Error: {call.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiLogPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Use useSyncExternalStore for subscribing to the API call store
  const calls = useSyncExternalStore(
    subscribeToApiCalls,
    getApiCalls,
    getApiCalls // Server snapshot (same as client for this use case)
  );

  const handleClear = () => {
    clearApiCalls();
  };

  const hasUnread = calls.length > 0;

  return (
    <div className="border-t border-zinc-800 bg-zinc-900/50">
      {/* Header - always visible */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-zinc-800/30"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">API Calls</span>
          {calls.length > 0 && (
            <span className="bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0.5 rounded-full">
              {calls.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {calls.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-700/50"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button className="text-zinc-500">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto border-t border-zinc-800">
          {calls.length === 0 ? (
            <div className="px-4 py-8 text-center text-zinc-500 text-sm">
              No API calls yet. Execute a query to see cURL commands here.
            </div>
          ) : (
            calls.map((call) => <ApiCallRow key={call.id} call={call} />)
          )}
        </div>
      )}
    </div>
  );
}
