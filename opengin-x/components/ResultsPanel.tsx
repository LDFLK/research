"use client";

import React, { useState, useMemo } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  FileJson,
  Loader2,
  Send,
  Eye,
  Code,
} from "lucide-react";
import { ApiResponse, ExploreResult } from "@/lib/types";
import { decodeProtobufValues, hasProtobufValues } from "@/lib/protobuf";
import JsonViewer from "./JsonViewer";
import AttributeExplorer from "./AttributeExplorer";

interface ResultsPanelProps {
  response: ApiResponse | null;
  isLoading: boolean;
  exploreResult?: ExploreResult | null;
  isExploreMode?: boolean;
}

type ViewMode = "decoded" | "raw";
type DisplayMode = "tree" | "text";

export default function ResultsPanel({
  response,
  isLoading,
  exploreResult,
  isExploreMode,
}: ResultsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("decoded");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("tree");

  // Decode protobuf values in the response
  const decodedData = useMemo(() => {
    if (!response?.data) return null;
    return decodeProtobufValues(response.data);
  }, [response?.data]);

  // Check if response has protobuf values
  const hasProtobuf = useMemo(() => {
    if (!response?.data) return false;
    return hasProtobufValues(response.data);
  }, [response?.data]);

  const displayData = viewMode === "decoded" ? decodedData : response?.data;

  const handleCopy = async () => {
    if (displayData) {
      await navigator.clipboard.writeText(JSON.stringify(displayData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-400 bg-green-400/10";
    if (status >= 400 && status < 500) return "text-yellow-400 bg-yellow-400/10";
    return "text-red-400 bg-red-400/10";
  };

  const getMethodColor = (method: string) => {
    return method === "POST"
      ? "text-orange-400 bg-orange-400/10"
      : "text-blue-400 bg-blue-400/10";
  };

  // Render Attribute Explorer for explore mode
  if (isExploreMode) {
    return (
      <div className="h-full">
        <AttributeExplorer result={exploreResult || null} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Request Info Preview */}
      {response && (
        <div className="p-3 border-b border-zinc-800 bg-zinc-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">
              Request
            </span>
            <a
              href={response.endpoint}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              Open <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${getMethodColor(
                response.method
              )}`}
            >
              {response.method}
            </span>
            <code className="text-xs text-zinc-300 break-all font-mono flex-1">
              {response.endpoint}
            </code>
          </div>
          {response.requestBody !== undefined && response.requestBody !== null && (
            <div className="mt-2">
              <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
                <Send className="w-3 h-3" />
                Request Body
              </div>
              <pre className="text-xs text-zinc-400 bg-zinc-800/50 p-2 rounded font-mono overflow-x-auto">
                {JSON.stringify(response.requestBody, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Response Header */}
      {response && (
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">
              Response
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                response.status
              )}`}
            >
              {response.status}
            </span>

            {/* Data View Mode (Decoded/Raw) - only show if has protobuf */}
            {hasProtobuf && (
              <div className="flex items-center gap-1 bg-zinc-800 rounded-md p-0.5">
                <button
                  onClick={() => setViewMode("decoded")}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    viewMode === "decoded"
                      ? "bg-green-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Human readable (decoded protobuf values)"
                >
                  <Eye className="w-3 h-3" />
                  Decoded
                </button>
                <button
                  onClick={() => setViewMode("raw")}
                  className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    viewMode === "raw"
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title="Raw protobuf values"
                >
                  <Code className="w-3 h-3" />
                  Raw
                </button>
              </div>
            )}

            {/* Display Mode (Tree/Text) */}
            <div className="flex items-center gap-1 bg-zinc-800 rounded-md p-0.5">
              <button
                onClick={() => setDisplayMode("tree")}
                className={`px-2 py-1 text-xs rounded ${
                  displayMode === "tree"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Tree
              </button>
              <button
                onClick={() => setDisplayMode("text")}
                className={`px-2 py-1 text-xs rounded ${
                  displayMode === "text"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Text
              </button>
            </div>
          </div>
          <button onClick={handleCopy} className="btn-secondary">
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}

      {/* Protobuf indicator */}
      {response && hasProtobuf && (
        <div className="px-3 py-1.5 bg-green-500/10 border-b border-green-500/20 flex items-center gap-2">
          <Eye className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400">
            {viewMode === "decoded"
              ? "Showing decoded protobuf values (human readable)"
              : "Showing raw protobuf-encoded values"}
          </span>
        </div>
      )}

      {/* Response Content */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p>Fetching data...</p>
          </div>
        ) : response ? (
          response.error ? (
            <div className="flex flex-col items-center justify-center text-red-400 p-6">
              <AlertCircle className="w-12 h-12 mb-3" />
              <p className="font-medium mb-2">Error</p>
              <p className="text-sm text-zinc-400">{response.error}</p>
            </div>
          ) : displayMode === "tree" ? (
            <JsonViewer data={displayData} />
          ) : (
            <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(displayData, null, 2)}
            </pre>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <FileJson className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium mb-1">No Results Yet</p>
            <p className="text-sm">Select a query type and execute a query</p>
          </div>
        )}
      </div>
    </div>
  );
}
