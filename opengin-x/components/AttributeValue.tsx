"use client";

import React, { useState } from "react";
import { Table, Code, Loader2, AlertCircle, Calendar, Eye } from "lucide-react";
import { AttributeNode, AttributeValueData } from "@/lib/types";

interface AttributeValueProps {
  attribute: AttributeNode | null;
  loading?: boolean;
  error?: string;
}

export default function AttributeValue({
  attribute,
  loading,
  error,
}: AttributeValueProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (!attribute) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8">
        <Table className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium mb-1">Select an Attribute</p>
        <p className="text-sm text-center">
          Click on a dataset in the tree to view its value
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p>Loading attribute value...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-400 p-8">
        <AlertCircle className="w-12 h-12 mb-3" />
        <p className="font-medium mb-2">Error Loading Value</p>
        <p className="text-sm text-zinc-400">{error}</p>
      </div>
    );
  }

  const value = attribute.value;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-medium text-white text-lg">{attribute.name}</h3>
            <p className="text-xs text-zinc-500">
              {attribute.kind.major}
              {attribute.kind.minor && ` / ${attribute.kind.minor}`}
            </p>
          </div>
          {value?.raw !== undefined && (
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                showRaw
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {showRaw ? <Eye className="w-3 h-3" /> : <Code className="w-3 h-3" />}
              {showRaw ? "Table" : "Raw JSON"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created: {new Date(attribute.created).toLocaleDateString()}
          </span>
          <span className="text-zinc-700">ID: {attribute.id}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {!value ? (
          <div className="text-center text-zinc-500 py-8">
            <p>No value data available</p>
          </div>
        ) : showRaw ? (
          <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap break-all bg-zinc-900 p-4 rounded-lg">
            {JSON.stringify(value.raw, null, 2)}
          </pre>
        ) : value.columns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {value.columns.map((col, i) => (
                    <th
                      key={i}
                      className="text-left py-2 px-3 text-zinc-400 font-medium whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {value.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30"
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="py-2 px-3 text-zinc-300 whitespace-nowrap"
                      >
                        {formatCellValue(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {value.rows.length === 0 && (
              <p className="text-center text-zinc-500 py-4">No rows</p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-zinc-500 mb-4">
              Unable to display as table. Showing raw data:
            </p>
            <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap break-all bg-zinc-900 p-4 rounded-lg">
              {JSON.stringify(value.raw, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
