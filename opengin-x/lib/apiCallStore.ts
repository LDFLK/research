/**
 * Simple state management for API call history
 * Uses pub/sub pattern for React integration
 */

import { ApiCallLog } from "./curl";

// Maximum number of calls to keep in history
const MAX_HISTORY = 50;

// In-memory store
let calls: ApiCallLog[] = [];
let listeners: Set<() => void> = new Set();

/**
 * Add a new API call to the store
 */
export function addApiCall(call: ApiCallLog): void {
  calls = [call, ...calls].slice(0, MAX_HISTORY);
  notifyListeners();
}

/**
 * Update an existing API call (e.g., when response arrives)
 */
export function updateApiCall(
  id: string,
  updates: Partial<Pick<ApiCallLog, "status" | "duration" | "error">>
): void {
  calls = calls.map((call) =>
    call.id === id ? { ...call, ...updates } : call
  );
  notifyListeners();
}

/**
 * Get all API calls
 */
export function getApiCalls(): ApiCallLog[] {
  return calls;
}

/**
 * Clear all API calls
 */
export function clearApiCalls(): void {
  calls = [];
  notifyListeners();
}

/**
 * Subscribe to API call changes
 * Returns an unsubscribe function
 */
export function subscribeToApiCalls(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Notify all listeners of state changes
 */
function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}
