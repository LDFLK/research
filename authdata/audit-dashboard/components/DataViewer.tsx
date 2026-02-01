'use client';

import { useMemo } from 'react';

interface Props {
  data: unknown;
  maxHeight?: string;
}

export default function DataViewer({ data, maxHeight = '300px' }: Props) {
  const formattedData = useMemo(() => {
    if (typeof data === 'string') {
      // Try to parse as JSON for pretty printing
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  }, [data]);

  const highlightedHtml = useMemo(() => {
    return syntaxHighlight(formattedData);
  }, [formattedData]);

  return (
    <div
      className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto"
      style={{ maxHeight }}
    >
      <pre
        className="p-3 text-xs font-mono whitespace-pre-wrap break-words"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}

function syntaxHighlight(json: string): string {
  // Escape HTML
  let escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply syntax highlighting
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key'; // key
        } else {
          cls = 'json-string'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean'; // boolean
      } else if (/null/.test(match)) {
        cls = 'json-null'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}
