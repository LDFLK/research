import {
  QueryParams,
  ApiResponse,
  QueryType,
  EntitySearchRequest,
  RelationsRequest,
  CategoryNode,
  AttributeNode,
  AttributeValueData,
  RelationResult,
  ExploreResult,
} from "./types";
import { decodeProtobufValues } from "./protobuf";
import { toCurl, generateCallId, CurlRequest } from "./curl";
import { addApiCall, updateApiCall } from "./apiCallStore";

const API_BASE = "/api/proxy";
const EXTERNAL_API_BASE =
  "https://aaf8ece1-3077-4a52-ab05-183a424f6d93-dev.e1-us-east-azure.choreoapis.dev/data-platform/read-api/v1.0/v1/entities";

/**
 * Logged fetch - wraps fetch to log API calls with cURL commands
 */
async function loggedFetch(
  url: string,
  options: RequestInit,
  externalUrl: string
): Promise<Response> {
  const method = (options.method || "GET") as "GET" | "POST";
  const headers: Record<string, string> = {};

  // Extract headers
  if (options.headers) {
    const h = options.headers as Record<string, string>;
    for (const [key, value] of Object.entries(h)) {
      headers[key] = value;
    }
  }

  // Parse body if present
  let body: unknown;
  if (options.body && typeof options.body === "string") {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = options.body;
    }
  }

  // Generate cURL command using external URL (the real API URL)
  const curlRequest: CurlRequest = {
    url: externalUrl,
    method,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
    body,
  };

  const callId = generateCallId();
  const startTime = performance.now();

  // Log the call immediately (before response)
  addApiCall({
    id: callId,
    timestamp: Date.now(),
    curl: toCurl(curlRequest),
    method,
    url: externalUrl,
  });

  try {
    const response = await fetch(url, options);
    const duration = Math.round(performance.now() - startTime);

    // Update with response info
    updateApiCall(callId, {
      status: response.status,
      duration,
    });

    return response;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    updateApiCall(callId, {
      duration,
      error: error instanceof Error ? error.message : "Network error",
    });
    throw error;
  }
}

export function getQueryTypeLabel(type: QueryType): string {
  switch (type) {
    case "search":
      return "Search Entity";
    case "metadata":
      return "Metadata";
    case "attributes":
      return "Attributes";
    case "relations":
      return "Relations";
    case "explore":
      return "Explore Attributes";
  }
}

export function getQueryTypeDescription(type: QueryType): string {
  switch (type) {
    case "search":
      return "Search by ID or kind";
    case "metadata":
      return "Entity metadata";
    case "attributes":
      return "Entity attribute values";
    case "relations":
      return "Entity relationships";
    case "explore":
      return "Discover all attributes";
  }
}

interface RequestInfo {
  endpoint: string;
  method: "GET" | "POST";
  body?: unknown;
  externalUrl: string;
}

function buildRequest(params: QueryParams): RequestInfo {
  const { queryType } = params;

  switch (queryType) {
    case "search": {
      const body: EntitySearchRequest = {};
      if (params.entityId) {
        body.id = params.entityId;
      }
      if (params.kindMajor) {
        body.kind = { major: params.kindMajor };
        if (params.kindMinor) {
          body.kind.minor = params.kindMinor;
        }
      }
      if (params.entityName) {
        body.name = params.entityName;
      }
      return {
        endpoint: `${API_BASE}/search`,
        method: "POST",
        body,
        externalUrl: `${EXTERNAL_API_BASE}/search`,
      };
    }

    case "metadata": {
      const entityId = encodeURIComponent(params.entityId || "");
      return {
        endpoint: `${API_BASE}/${entityId}/metadata`,
        method: "GET",
        externalUrl: `${EXTERNAL_API_BASE}/${entityId}/metadata`,
      };
    }

    case "attributes": {
      const entityId = encodeURIComponent(params.entityId || "");
      const attrName = encodeURIComponent(params.attributeName || "");
      const searchParams = new URLSearchParams();
      if (params.startTime) searchParams.set("startTime", params.startTime);
      if (params.endTime) searchParams.set("endTime", params.endTime);
      if (params.fields && params.fields.length > 0) {
        params.fields.forEach((f) => searchParams.append("fields", f));
      }
      const qs = searchParams.toString();
      const path = `/${entityId}/attributes/${attrName}${qs ? `?${qs}` : ""}`;
      return {
        endpoint: `${API_BASE}${path}`,
        method: "GET",
        externalUrl: `${EXTERNAL_API_BASE}${path}`,
      };
    }

    case "relations": {
      const entityId = encodeURIComponent(params.entityId || "");
      const body: RelationsRequest = {};
      if (params.relationId) {
        body.id = params.relationId;
      } else {
        if (params.relatedEntityId) body.relatedEntityId = params.relatedEntityId;
        if (params.relationName) body.name = params.relationName;
        if (params.direction) body.direction = params.direction;
        // Use either activeAt OR startTime/endTime
        if (params.activeAt) {
          body.activeAt = params.activeAt;
        } else {
          if (params.startTime) body.startTime = params.startTime;
          if (params.endTime) body.endTime = params.endTime;
        }
      }
      return {
        endpoint: `${API_BASE}/${entityId}/relations`,
        method: "POST",
        body: Object.keys(body).length > 0 ? body : undefined,
        externalUrl: `${EXTERNAL_API_BASE}/${entityId}/relations`,
      };
    }

    case "explore": {
      // Explore doesn't use the standard request flow
      // This case is handled by exploreEntity() instead
      const entityId = encodeURIComponent(params.entityId || "");
      return {
        endpoint: `${API_BASE}/${entityId}/relations`,
        method: "POST",
        externalUrl: `${EXTERNAL_API_BASE}/${entityId}/relations`,
      };
    }
  }
}

export async function executeQuery(params: QueryParams): Promise<ApiResponse> {
  const request = buildRequest(params);

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (request.body) {
      fetchOptions.body = JSON.stringify(request.body);
    }

    const response = await loggedFetch(
      request.endpoint,
      fetchOptions,
      request.externalUrl
    );
    const data = await response.json();

    return {
      data,
      status: response.status,
      endpoint: request.externalUrl,
      method: request.method,
      requestBody: request.body,
    };
  } catch (error) {
    return {
      data: null,
      status: 500,
      endpoint: request.externalUrl,
      method: request.method,
      requestBody: request.body,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export function validateParams(params: QueryParams): string | null {
  switch (params.queryType) {
    case "search":
      if (!params.entityId && !params.kindMajor && !params.entityName) {
        return "At least one search criteria is required (Entity ID, Kind, or Name)";
      }
      break;
    case "metadata":
    case "relations":
    case "explore":
      if (!params.entityId) {
        return "Entity ID is required";
      }
      break;
    case "attributes":
      if (!params.entityId) {
        return "Entity ID is required";
      }
      if (!params.attributeName) {
        return "Attribute name is required";
      }
      break;
  }
  return null;
}

// Attribute Explorer API functions

interface EntityInfo {
  id: string;
  kind: { major: string; minor?: string };
  name: string;
  created: string;
  terminated?: string | null;
}

// Recursively find entity-like objects in a response
function findEntityInResponse(data: unknown, targetId: string): EntityInfo | null {
  if (!data) return null;

  // Check if this object looks like an entity
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;

    // Check if this is the entity we're looking for
    if (obj.id === targetId && ("name" in obj || "kind" in obj)) {
      return {
        id: obj.id as string,
        name: (obj.name as string) || targetId,
        kind: (obj.kind as { major: string; minor?: string }) || { major: "UNKNOWN" },
        created: (obj.created as string) || "",
        terminated: obj.terminated as string | null | undefined,
      };
    }

    // Check arrays
    if (Array.isArray(data)) {
      for (const item of data) {
        const found = findEntityInResponse(item, targetId);
        if (found) return found;
      }
    }

    // Check nested properties
    for (const key of Object.keys(obj)) {
      const found = findEntityInResponse(obj[key], targetId);
      if (found) return found;
    }
  }

  return null;
}

async function fetchEntityById(
  entityId: string,
  signal?: AbortSignal
): Promise<EntityInfo | null> {
  try {
    const body: EntitySearchRequest = { id: entityId };
    const response = await loggedFetch(
      `${API_BASE}/search`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      },
      `${EXTERNAL_API_BASE}/search`
    );
    if (!response.ok) {
      console.log(`[fetchEntityById] Response not OK for ${entityId}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    const decoded = decodeProtobufValues(data);

    // Log for debugging
    console.log(`[fetchEntityById] Raw response for ${entityId}:`, JSON.stringify(decoded, null, 2));

    // Try to find the entity anywhere in the response
    const result = findEntityInResponse(decoded, entityId);

    console.log(`[fetchEntityById] Extracted entity for ${entityId}:`, result);
    return result;
  } catch (error) {
    console.error(`[fetchEntityById] Error fetching ${entityId}:`, error);
    return null;
  }
}

async function fetchEntityRelations(
  entityId: string,
  relationName?: string,
  signal?: AbortSignal
): Promise<RelationResult[]> {
  try {
    const body: RelationsRequest = {};
    if (relationName) body.name = relationName;

    const encodedId = encodeURIComponent(entityId);
    const response = await loggedFetch(
      `${API_BASE}/${encodedId}/relations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      },
      `${EXTERNAL_API_BASE}/${encodedId}/relations`
    );

    if (!response.ok) return [];
    const data = await response.json();
    const decoded = decodeProtobufValues(data) as RelationResult[] | { relations?: RelationResult[] };

    // Handle both array and object responses
    if (Array.isArray(decoded)) return decoded;
    if (decoded && typeof decoded === "object" && "relations" in decoded) {
      return decoded.relations || [];
    }
    return [];
  } catch {
    return [];
  }
}

async function fetchAttributeValue(
  entityId: string,
  attributeName: string
): Promise<AttributeValueData | null> {
  try {
    const encodedEntityId = encodeURIComponent(entityId);
    const encodedAttrName = encodeURIComponent(attributeName);
    const response = await loggedFetch(
      `${API_BASE}/${encodedEntityId}/attributes/${encodedAttrName}`,
      {},
      `${EXTERNAL_API_BASE}/${encodedEntityId}/attributes/${encodedAttrName}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    const decoded = decodeProtobufValues(data);
    return decodeProtobufStruct(decoded);
  } catch {
    return null;
  }
}

// Decode protobuf Struct format (columns/rows)
function decodeProtobufStruct(data: unknown): AttributeValueData | null {
  if (!data) return null;

  // Handle array of attribute values
  if (Array.isArray(data)) {
    // Try to extract structured data from the first item
    const firstItem = data[0];
    if (firstItem && typeof firstItem === "object" && "value" in firstItem) {
      const value = (firstItem as { value: unknown }).value;
      return parseStructValue(value);
    }
    return { columns: [], rows: [], raw: data };
  }

  // Handle object with values array
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if ("values" in obj && Array.isArray(obj.values)) {
      const firstValue = obj.values[0];
      if (firstValue && typeof firstValue === "object" && "value" in firstValue) {
        const value = (firstValue as { value: unknown }).value;
        return parseStructValue(value);
      }
    }
  }

  return { columns: [], rows: [], raw: data };
}

function parseStructValue(value: unknown): AttributeValueData | null {
  if (!value || typeof value !== "object") {
    return { columns: [], rows: [], raw: value };
  }

  const obj = value as Record<string, unknown>;

  // Check for columns/rows structure
  if ("columns" in obj && "rows" in obj) {
    const columns = Array.isArray(obj.columns) ? obj.columns.map(String) : [];
    const rows = Array.isArray(obj.rows) ? obj.rows as unknown[][] : [];
    return { columns, rows, raw: value };
  }

  // Check for fields structure (protobuf Struct)
  if ("fields" in obj && typeof obj.fields === "object") {
    const fields = obj.fields as Record<string, unknown>;
    const columns = Object.keys(fields);
    const rows = [columns.map((col) => extractFieldValue(fields[col]))];
    return { columns, rows, raw: value };
  }

  return { columns: [], rows: [], raw: value };
}

function extractFieldValue(field: unknown): unknown {
  if (!field || typeof field !== "object") return field;
  const f = field as Record<string, unknown>;

  // Handle protobuf Value types
  if ("stringValue" in f) return f.stringValue;
  if ("numberValue" in f) return f.numberValue;
  if ("boolValue" in f) return f.boolValue;
  if ("listValue" in f) {
    const list = f.listValue as { values?: unknown[] };
    return list.values?.map(extractFieldValue) || [];
  }
  if ("structValue" in f) return f.structValue;

  return field;
}

export async function exploreEntity(
  entityId: string,
  signal?: AbortSignal
): Promise<ExploreResult> {
  const result: ExploreResult = {
    entityId,
    categories: [],
    relations: [],
    loading: true,
  };

  try {
    if (signal?.aborted) {
      result.error = "Cancelled";
      result.loading = false;
      return result;
    }

    // Get AS_CATEGORY relations for this entity
    const categoryRelations = await fetchEntityRelations(entityId, "AS_CATEGORY", signal);
    console.log(`[exploreEntity] Found ${categoryRelations.length} AS_CATEGORY relations:`, categoryRelations);

    // Store raw relations for debugging/display
    result.relations = categoryRelations;

    // Fetch entity info for each related category to get names
    const categoryPromises = categoryRelations.map(async (rel) => {
      console.log(`[exploreEntity] Fetching entity info for: ${rel.relatedEntityId}`);
      const entityInfo = await fetchEntityById(rel.relatedEntityId, signal);
      console.log(`[exploreEntity] Got entity info:`, entityInfo);

      const category = {
        id: rel.relatedEntityId,
        name: entityInfo?.name || rel.relatedEntityId,
        kind: entityInfo?.kind || { major: "UNKNOWN" },
        children: [],
        attributes: [],
        expanded: false,
        relationDirection: rel.direction,
        relationId: rel.id,
        startTime: rel.startTime,
        endTime: rel.endTime,
      } as CategoryNode;

      console.log(`[exploreEntity] Created category node:`, category);
      return category;
    });

    result.categories = await Promise.all(categoryPromises);
    console.log(`[exploreEntity] Final categories:`, result.categories);
    result.loading = false;
  } catch (error) {
    if (signal?.aborted) {
      result.error = "Cancelled";
    } else {
      result.error = error instanceof Error ? error.message : "Failed to explore entity";
    }
    result.loading = false;
  }

  return result;
}

export async function getAttributeValue(
  entityId: string,
  attributeName: string
): Promise<AttributeValueData | null> {
  return fetchAttributeValue(entityId, attributeName);
}
