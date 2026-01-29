"use client";

import React, { useState, useCallback } from "react";
import { Loader2, AlertCircle, Search } from "lucide-react";
import { ExploreResult, AttributeNode, CategoryNode } from "@/lib/types";
import { getAttributeValue } from "@/lib/api";
import AttributeTree from "./AttributeTree";
import AttributeValue from "./AttributeValue";

interface AttributeExplorerProps {
  result: ExploreResult | null;
  isLoading: boolean;
}

export default function AttributeExplorer({
  result,
  isLoading,
}: AttributeExplorerProps) {
  const [selectedAttribute, setSelectedAttribute] = useState<AttributeNode | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loadingValue, setLoadingValue] = useState(false);
  const [valueError, setValueError] = useState<string | null>(null);

  const handleSelectAttribute = useCallback(
    async (attr: AttributeNode, categoryId: string) => {
      setSelectedAttribute(attr);
      setSelectedCategoryId(categoryId);
      setValueError(null);

      // If we already have the value, don't refetch
      if (attr.value) return;

      setLoadingValue(true);
      try {
        const value = await getAttributeValue(categoryId, attr.name);
        // Update the attribute with the fetched value
        setSelectedAttribute((prev) =>
          prev?.id === attr.id ? { ...prev, value: value || undefined } : prev
        );
      } catch (error) {
        setValueError(
          error instanceof Error ? error.message : "Failed to load attribute value"
        );
      } finally {
        setLoadingValue(false);
      }
    },
    []
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg font-medium mb-1">Exploring Entity</p>
        <p className="text-sm">Traversing category hierarchy...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-zinc-500">
        <Search className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium mb-1">Attribute Explorer</p>
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

  // Count total attributes
  const countAttributes = (categories: CategoryNode[]): number => {
    return categories.reduce((sum, cat) => {
      return sum + cat.attributes.length + countAttributes(cat.children);
    }, 0);
  };

  const totalAttributes = countAttributes(result.categories);

  return (
    <div className="h-full flex flex-col">
      {/* Entity Info Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-white">
              {result.entityName || result.entityId}
            </h2>
            <p className="text-xs text-zinc-500">
              {result.categories.length} categories, {totalAttributes} attributes
            </p>
          </div>
          <span className="text-xs text-zinc-600 font-mono">{result.entityId}</span>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex min-h-0">
        {/* Tree Panel */}
        <div className="w-1/2 border-r border-zinc-800 overflow-auto">
          <AttributeTree
            categories={result.categories}
            selectedAttribute={selectedAttribute}
            onSelectAttribute={handleSelectAttribute}
          />
        </div>

        {/* Value Panel */}
        <div className="w-1/2 overflow-auto">
          <AttributeValue
            attribute={selectedAttribute}
            loading={loadingValue}
            error={valueError || undefined}
          />
        </div>
      </div>
    </div>
  );
}
