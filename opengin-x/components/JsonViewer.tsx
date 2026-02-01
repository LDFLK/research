"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface JsonViewerProps {
  data: unknown;
  initialExpanded?: boolean;
}

interface JsonNodeProps {
  keyName?: string;
  value: unknown;
  depth: number;
  initialExpanded: boolean;
}

function JsonNode({ keyName, value, depth, initialExpanded }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded && depth < 2);

  const indent = depth * 16;

  if (value === null) {
    return (
      <div style={{ paddingLeft: indent }} className="flex items-center py-0.5">
        {keyName && <span className="json-key">&quot;{keyName}&quot;</span>}
        {keyName && <span className="text-zinc-500">: </span>}
        <span className="json-null">null</span>
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div style={{ paddingLeft: indent }} className="flex items-center py-0.5">
        {keyName && <span className="json-key">&quot;{keyName}&quot;</span>}
        {keyName && <span className="text-zinc-500">: </span>}
        <span className="json-boolean">{value.toString()}</span>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div style={{ paddingLeft: indent }} className="flex items-center py-0.5">
        {keyName && <span className="json-key">&quot;{keyName}&quot;</span>}
        {keyName && <span className="text-zinc-500">: </span>}
        <span className="json-number">{value}</span>
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <div style={{ paddingLeft: indent }} className="flex items-start py-0.5">
        {keyName && <span className="json-key">&quot;{keyName}&quot;</span>}
        {keyName && <span className="text-zinc-500">: </span>}
        <span className="json-string break-all">&quot;{value}&quot;</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div style={{ paddingLeft: indent }} className="flex items-center py-0.5">
          {keyName && <span className="json-key">&quot;{keyName}&quot;</span>}
          {keyName && <span className="text-zinc-500">: </span>}
          <span className="json-bracket">[]</span>
        </div>
      );
    }

    return (
      <div style={{ paddingLeft: indent }}>
        <div
          className="flex items-center py-0.5 cursor-pointer hover:bg-zinc-800/50 -ml-4 pl-4 rounded"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-zinc-500 mr-1 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-500 mr-1 flex-shrink-0" />
          )}
          {keyName && <span className="json-key">&quot;{keyName}&quot;</span>}
          {keyName && <span className="text-zinc-500">: </span>}
          <span className="json-bracket">[</span>
          {!isExpanded && (
            <span className="text-zinc-500 text-xs ml-1">
              {value.length} item{value.length !== 1 ? "s" : ""}
            </span>
          )}
          {!isExpanded && <span className="json-bracket">]</span>}
        </div>
        {isExpanded && (
          <>
            {value.map((item, index) => (
              <JsonNode
                key={index}
                value={item}
                depth={depth + 1}
                initialExpanded={initialExpanded}
              />
            ))}
            <div style={{ paddingLeft: indent }} className="json-bracket">
              ]
            </div>
          </>
        )}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return (
        <div style={{ paddingLeft: indent }} className="flex items-center py-0.5">
          {keyName && <span className="json-key">&quot;{keyName}&quot;</span>}
          {keyName && <span className="text-zinc-500">: </span>}
          <span className="json-bracket">{"{}"}</span>
        </div>
      );
    }

    return (
      <div style={{ paddingLeft: indent }}>
        <div
          className="flex items-center py-0.5 cursor-pointer hover:bg-zinc-800/50 -ml-4 pl-4 rounded"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-zinc-500 mr-1 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-500 mr-1 flex-shrink-0" />
          )}
          {keyName && <span className="json-key">&quot;{keyName}&quot;</span>}
          {keyName && <span className="text-zinc-500">: </span>}
          <span className="json-bracket">{"{"}</span>
          {!isExpanded && (
            <span className="text-zinc-500 text-xs ml-1">
              {entries.length} key{entries.length !== 1 ? "s" : ""}
            </span>
          )}
          {!isExpanded && <span className="json-bracket">{"}"}</span>}
        </div>
        {isExpanded && (
          <>
            {entries.map(([key, val]) => (
              <JsonNode
                key={key}
                keyName={key}
                value={val}
                depth={depth + 1}
                initialExpanded={initialExpanded}
              />
            ))}
            <div style={{ paddingLeft: indent }} className="json-bracket">
              {"}"}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}

export default function JsonViewer({ data, initialExpanded = true }: JsonViewerProps) {
  return (
    <div className="font-mono text-sm overflow-x-auto">
      <JsonNode value={data} depth={0} initialExpanded={initialExpanded} />
    </div>
  );
}
