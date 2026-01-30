"use client";

import React, { useState } from "react";
import { Loader2, AlertCircle, Search, Folder, FolderOpen, ChevronRight, ChevronDown, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { ExploreResult, CategoryNode } from "@/lib/types";

interface AttributeExplorerProps {
  result: ExploreResult | null;
  isLoading: boolean;
}

interface TreeNodeProps {
  category: CategoryNode;
  isSelected: boolean;
  onSelect: (cat: CategoryNode) => void;
}

function TreeNode({ category, isSelected, onSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const isOutgoing = category.relationDirection === "OUTGOING";

  // Check if name is different from id (meaning we have a real name)
  const hasRealName = category.name && category.name !== category.id;
  const displayName = hasRealName ? category.name : null;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-colors ${
          isSelected
            ? "bg-blue-900/40 text-blue-300"
            : "hover:bg-zinc-800/50 text-zinc-300"
        }`}
        onClick={() => onSelect(category)}
      >
        {/* Expand/collapse chevron */}
        <button
          className="p-0.5 hover:bg-zinc-700 rounded flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {/* Folder icon */}
        <div className="flex-shrink-0">
          {expanded ? (
            <FolderOpen className="w-4 h-4 text-yellow-500" />
          ) : (
            <Folder className="w-4 h-4 text-yellow-600" />
          )}
        </div>

        {/* Direction indicator */}
        <div className="flex-shrink-0">
          {isOutgoing ? (
            <ArrowUpRight className="w-3 h-3 text-green-500" />
          ) : (
            <ArrowDownLeft className="w-3 h-3 text-orange-500" />
          )}
        </div>

        {/* Main content - name and kind */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {displayName ? (
              <span className="text-sm font-medium truncate">{displayName}</span>
            ) : (
              <span className="text-sm font-mono text-zinc-400 truncate">{category.id}</span>
            )}
          </div>
          {/* Kind info shown inline */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-400">
              {category.kind.major}
            </span>
            {category.kind.minor && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-400">
                {category.kind.minor}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content - full details */}
      {expanded && (
        <div className="ml-6 pl-4 border-l border-zinc-700 mt-1 mb-2 bg-zinc-900/50 rounded-r py-2">
          <div className="text-xs space-y-2 px-2">
            {/* Name */}
            <div className="flex items-start gap-2">
              <span className="text-zinc-500 w-20 flex-shrink-0">Name:</span>
              <span className={displayName ? "text-white font-medium" : "text-zinc-500 italic"}>
                {displayName || "(no name)"}
              </span>
            </div>

            {/* Entity ID */}
            <div className="flex items-start gap-2">
              <span className="text-zinc-500 w-20 flex-shrink-0">Entity ID:</span>
              <span className="font-mono text-zinc-300 break-all">{category.id}</span>
            </div>

            {/* Kind Major */}
            <div className="flex items-start gap-2">
              <span className="text-zinc-500 w-20 flex-shrink-0">Kind Major:</span>
              <span className="text-blue-400">{category.kind.major}</span>
            </div>

            {/* Kind Minor */}
            <div className="flex items-start gap-2">
              <span className="text-zinc-500 w-20 flex-shrink-0">Kind Minor:</span>
              <span className={category.kind.minor ? "text-purple-400" : "text-zinc-600 italic"}>
                {category.kind.minor || "(none)"}
              </span>
            </div>

            {/* Direction */}
            <div className="flex items-start gap-2">
              <span className="text-zinc-500 w-20 flex-shrink-0">Direction:</span>
              <span className={isOutgoing ? "text-green-400" : "text-orange-400"}>
                {category.relationDirection}
              </span>
            </div>

            {/* Start Time */}
            {category.startTime && (
              <div className="flex items-start gap-2">
                <span className="text-zinc-500 w-20 flex-shrink-0">Start:</span>
                <span className="text-zinc-400">{category.startTime}</span>
              </div>
            )}

            {/* End Time */}
            {category.endTime && (
              <div className="flex items-start gap-2">
                <span className="text-zinc-500 w-20 flex-shrink-0">End:</span>
                <span className="text-zinc-400">{category.endTime}</span>
              </div>
            )}

            {/* Relation ID */}
            {category.relationId && (
              <div className="flex items-start gap-2">
                <span className="text-zinc-500 w-20 flex-shrink-0">Relation ID:</span>
                <span className="font-mono text-zinc-500 text-[10px] break-all">{category.relationId}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AttributeExplorer({
  result,
  isLoading,
}: AttributeExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg font-medium mb-1">Exploring Entity</p>
        <p className="text-sm">Fetching categories...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500">
        <Search className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium mb-1">Category Explorer</p>
        <p className="text-sm">Enter an entity ID and click Explore</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-red-400 p-8">
        <AlertCircle className="w-12 h-12 mb-3" />
        <p className="font-medium mb-2">Exploration Failed</p>
        <p className="text-sm text-zinc-400">{result.error}</p>
      </div>
    );
  }

  const outgoingCategories = result.categories?.filter((c) => c.relationDirection === "OUTGOING") || [];
  const incomingCategories = result.categories?.filter((c) => c.relationDirection === "INCOMING") || [];

  return (
    <div className="h-full flex flex-col">
      {/* Entity Info Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-medium text-white font-mono">
                {result.entityId}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {result.categories?.length || 0} categories
              {outgoingCategories.length > 0 && (
                <span className="text-green-500 ml-2">
                  {outgoingCategories.length} outgoing
                </span>
              )}
              {incomingCategories.length > 0 && (
                <span className="text-orange-500 ml-2">
                  {incomingCategories.length} incoming
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showRaw
                ? "bg-zinc-700 text-zinc-200"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {showRaw ? "Tree View" : "Raw JSON"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {showRaw ? (
          /* Raw JSON View */
          <pre className="p-4 text-xs text-zinc-300 overflow-auto">
            {JSON.stringify(result.categories, null, 2)}
          </pre>
        ) : (
          /* Tree View */
          <div className="p-2">
            {result.categories && result.categories.length > 0 ? (
              <div className="space-y-0.5">
                {/* Outgoing categories first */}
                {outgoingCategories.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-zinc-500 px-2 py-1 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-green-500" />
                      Categories (Outgoing)
                    </div>
                    {outgoingCategories.map((cat) => (
                      <TreeNode
                        key={cat.relationId || cat.id}
                        category={cat}
                        isSelected={selectedCategory?.id === cat.id}
                        onSelect={setSelectedCategory}
                      />
                    ))}
                  </div>
                )}

                {/* Incoming categories */}
                {incomingCategories.length > 0 && (
                  <div>
                    <div className="text-xs text-zinc-500 px-2 py-1 flex items-center gap-1">
                      <ArrowDownLeft className="w-3 h-3 text-orange-500" />
                      Categories (Incoming)
                    </div>
                    {incomingCategories.map((cat) => (
                      <TreeNode
                        key={cat.relationId || cat.id}
                        category={cat}
                        isSelected={selectedCategory?.id === cat.id}
                        onSelect={setSelectedCategory}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-8">
                <Folder className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No categories found</p>
                <p className="text-xs mt-2">Try a different entity ID</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
