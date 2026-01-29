"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Table,
  Loader2,
} from "lucide-react";
import { CategoryNode, AttributeNode } from "@/lib/types";

interface AttributeTreeProps {
  categories: CategoryNode[];
  selectedAttribute: AttributeNode | null;
  onSelectAttribute: (attr: AttributeNode, categoryId: string) => void;
}

interface CategoryTreeNodeProps {
  node: CategoryNode;
  level: number;
  selectedAttribute: AttributeNode | null;
  onSelectAttribute: (attr: AttributeNode, categoryId: string) => void;
}

function CategoryTreeNode({
  node,
  level,
  selectedAttribute,
  onSelectAttribute,
}: CategoryTreeNodeProps) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = node.children.length > 0 || node.attributes.length > 0;

  return (
    <div className="select-none">
      {/* Category header */}
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-zinc-800/50 ${
          level > 0 ? "ml-4" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          )
        ) : (
          <div className="w-4 h-4 flex-shrink-0" />
        )}
        {expanded ? (
          <FolderOpen className="w-4 h-4 text-yellow-500 flex-shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-yellow-500 flex-shrink-0" />
        )}
        <span className="text-sm text-zinc-200 flex-1 min-w-0" title={node.name}>
          {node.name}
        </span>
        {node.kind && (
          <span className="text-xs text-zinc-500 flex-shrink-0">
            {node.kind.minor || node.kind.major}
          </span>
        )}
      </div>

      {/* Children and attributes */}
      {expanded && (
        <div>
          {/* Sub-categories */}
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedAttribute={selectedAttribute}
              onSelectAttribute={onSelectAttribute}
            />
          ))}

          {/* Attributes */}
          {node.attributes.map((attr) => (
            <AttributeTreeNode
              key={attr.id}
              attribute={attr}
              categoryId={node.id}
              level={level + 1}
              isSelected={selectedAttribute?.id === attr.id}
              onSelect={onSelectAttribute}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AttributeTreeNodeProps {
  attribute: AttributeNode;
  categoryId: string;
  level: number;
  isSelected: boolean;
  onSelect: (attr: AttributeNode, categoryId: string) => void;
}

function AttributeTreeNode({
  attribute,
  categoryId,
  level,
  isSelected,
  onSelect,
}: AttributeTreeNodeProps) {
  return (
    <div
      className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-500/20 text-blue-300"
          : "hover:bg-zinc-800/50 text-zinc-400"
      }`}
      style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
      onClick={() => onSelect(attribute, categoryId)}
    >
      {attribute.loading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : (
        <Table className="w-4 h-4 text-green-500 flex-shrink-0" />
      )}
      <span className="text-sm truncate" title={attribute.name}>
        {attribute.name}
      </span>
      <span className="text-xs text-zinc-600 ml-auto">Dataset</span>
    </div>
  );
}

export default function AttributeTree({
  categories,
  selectedAttribute,
  onSelectAttribute,
}: AttributeTreeProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-8">
        <Folder className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No categories found</p>
      </div>
    );
  }

  return (
    <div className="py-2">
      {categories.map((category) => (
        <CategoryTreeNode
          key={category.id}
          node={category}
          level={0}
          selectedAttribute={selectedAttribute}
          onSelectAttribute={onSelectAttribute}
        />
      ))}
    </div>
  );
}
