/**
 * cURL command generation utility for API telemetry
 */

export interface CurlRequest {
  url: string;
  method: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
}

export interface ApiCallLog {
  id: string;
  timestamp: number;
  curl: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
}

/**
 * Escape a string for safe use in a shell command
 */
function shellEscape(str: string): string {
  // Use single quotes and escape any existing single quotes
  return "'" + str.replace(/'/g, "'\\''") + "'";
}

/**
 * Convert a fetch request to a cURL command
 */
export function toCurl(request: CurlRequest): string {
  const parts: string[] = ["curl"];

  // Method
  parts.push("-X", request.method);

  // URL (quote to handle special characters)
  parts.push(shellEscape(request.url));

  // Headers
  if (request.headers) {
    for (const [key, value] of Object.entries(request.headers)) {
      parts.push("-H", shellEscape(`${key}: ${value}`));
    }
  }

  // Body for POST requests
  if (request.body !== undefined) {
    const bodyStr = typeof request.body === "string"
      ? request.body
      : JSON.stringify(request.body);
    parts.push("-d", shellEscape(bodyStr));
  }

  return parts.join(" ");
}

/**
 * Generate a unique ID for an API call log entry
 */
export function generateCallId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
