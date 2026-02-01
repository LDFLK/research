/**
 * Decodes protobuf value types found in API responses.
 *
 * Handles:
 * - StringValue: hex-encoded UTF-8 string
 * - Int32Value, Int64Value, UInt32Value, UInt64Value: numbers
 * - FloatValue, DoubleValue: floating point numbers
 * - BoolValue: boolean
 * - Struct: nested object with fields
 * - ListValue: array of values
 */

function hexToString(hex: string): string {
  try {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
  } catch {
    return hex; // Return original if decoding fails
  }
}

/**
 * Tries to extract and parse JSON from a hex-encoded protobuf value.
 * The hex string may contain a protobuf wrapper around JSON data.
 *
 * Protobuf format typically wraps data with field markers:
 * - 0A = field 1, wire type 2 (length-delimited)
 * - Following bytes indicate length, then the data
 */
function extractJsonFromHex(hex: string): unknown | null {
  try {
    // Decode the hex to bytes first
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }

    // Convert to string for JSON extraction
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes));

    console.log(`[extractJsonFromHex] Decoded length: ${decoded.length}, first 50 chars:`,
      decoded.substring(0, 50).replace(/[\x00-\x1F]/g, '?'));

    // Try to find JSON object in the decoded string
    // Look for the start of a JSON object or array
    const jsonStartObj = decoded.indexOf('{');
    const jsonStartArr = decoded.indexOf('[');

    let jsonStart = -1;
    if (jsonStartObj >= 0 && jsonStartArr >= 0) {
      jsonStart = Math.min(jsonStartObj, jsonStartArr);
    } else if (jsonStartObj >= 0) {
      jsonStart = jsonStartObj;
    } else if (jsonStartArr >= 0) {
      jsonStart = jsonStartArr;
    }

    console.log(`[extractJsonFromHex] JSON start position: ${jsonStart}`);

    if (jsonStart >= 0) {
      // Extract from JSON start to the end
      const jsonStr = decoded.substring(jsonStart);

      // Find the matching end bracket
      let depth = 0;
      let endPos = -1;
      const startChar = jsonStr[0];
      const endChar = startChar === '{' ? '}' : ']';
      let inString = false;
      let escapeNext = false;

      for (let i = 0; i < jsonStr.length; i++) {
        const c = jsonStr[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (c === '\\') {
          escapeNext = true;
          continue;
        }

        if (c === '"') {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (c === startChar) depth++;
          if (c === endChar) depth--;
          if (depth === 0) {
            endPos = i + 1;
            break;
          }
        }
      }

      console.log(`[extractJsonFromHex] JSON end position: ${endPos}, depth at end: ${depth}`);

      if (endPos > 0) {
        const cleanJson = jsonStr.substring(0, endPos);
        console.log(`[extractJsonFromHex] Found JSON (${cleanJson.length} chars):`,
          cleanJson.length > 200 ? cleanJson.substring(0, 200) + '...' : cleanJson);

        try {
          const parsed = JSON.parse(cleanJson);
          console.log(`[extractJsonFromHex] Successfully parsed JSON with keys:`,
            typeof parsed === 'object' && parsed !== null ? Object.keys(parsed) : 'not an object');
          return parsed;
        } catch (parseError) {
          console.error(`[extractJsonFromHex] JSON parse failed:`, parseError);
          console.log(`[extractJsonFromHex] Problematic JSON:`, cleanJson);
          return null;
        }
      }
    }

    // If no JSON found, return null (not the decoded string with control chars)
    console.log(`[extractJsonFromHex] No JSON found in hex string`);
    return null;
  } catch (error) {
    console.error(`[extractJsonFromHex] Error:`, error);
    return null;
  }
}

interface ProtobufValue {
  typeUrl?: string;
  value?: unknown;
  // Direct value fields (protobuf Value type)
  stringValue?: string;
  numberValue?: number;
  boolValue?: boolean;
  structValue?: { fields?: Record<string, unknown> };
  listValue?: { values?: unknown[] };
  nullValue?: unknown;
}

function isProtobufWrappedValue(obj: unknown): obj is ProtobufValue {
  if (typeof obj !== "object" || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return typeof record.typeUrl === "string" && "value" in record;
}

function isProtobufDirectValue(obj: unknown): obj is ProtobufValue {
  if (typeof obj !== "object" || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return (
    "stringValue" in record ||
    "numberValue" in record ||
    "boolValue" in record ||
    "structValue" in record ||
    "listValue" in record ||
    "nullValue" in record
  );
}

function decodeWrappedValue(obj: ProtobufValue): unknown {
  const typeUrl = obj.typeUrl || "";
  const value = obj.value;

  console.log(`[decodeWrappedValue] typeUrl=${typeUrl}, value type=${typeof value}`);

  if (typeUrl.includes("StringValue") && typeof value === "string") {
    return hexToString(value);
  }
  if (typeUrl.includes("Int") || typeUrl.includes("Float") || typeUrl.includes("Double")) {
    return typeof value === "string" ? parseFloat(value) : value;
  }
  if (typeUrl.includes("BoolValue")) {
    return value === true || value === "true" || value === 1;
  }

  // Handle Struct type - value can be hex-encoded string or object
  if (typeUrl.includes("Struct")) {
    if (typeof value === "string" && isHexString(value)) {
      console.log(`[decodeWrappedValue] Struct with hex value, extracting JSON...`);
      const extracted = extractJsonFromHex(value);
      if (extracted !== null) {
        console.log(`[decodeWrappedValue] Extracted JSON:`, extracted);
        return extracted;
      }
    }
    if (typeof value === "object") {
      return decodeProtobufValues(value);
    }
  }

  // Return raw value if type not recognized
  return value;
}

function decodeDirectValue(obj: ProtobufValue): unknown {
  if ("stringValue" in obj) return obj.stringValue;
  if ("numberValue" in obj) return obj.numberValue;
  if ("boolValue" in obj) return obj.boolValue;
  if ("nullValue" in obj) return null;
  if ("structValue" in obj && obj.structValue) {
    if (obj.structValue.fields) {
      const decoded: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(obj.structValue.fields)) {
        decoded[key] = decodeProtobufValues(val);
      }
      return decoded;
    }
    return decodeProtobufValues(obj.structValue);
  }
  if ("listValue" in obj && obj.listValue) {
    if (obj.listValue.values) {
      return obj.listValue.values.map(decodeProtobufValues);
    }
    return [];
  }
  return obj;
}

function tryParseProtobufString(str: string): unknown | null {
  try {
    const parsed = JSON.parse(str);
    if (isProtobufWrappedValue(parsed)) {
      return decodeWrappedValue(parsed);
    }
  } catch {
    // Not a JSON string, return null
  }
  return null;
}

/**
 * Checks if a string looks like a hex-encoded value (all hex chars, even length)
 */
function isHexString(str: string): boolean {
  // Must be at least 20 chars, even length, and all hex characters
  if (str.length < 20 || str.length % 2 !== 0) {
    return false;
  }
  // Use a simple loop instead of regex for better performance on long strings
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    // 0-9: 48-57, A-F: 65-70, a-f: 97-102
    const isHexChar = (c >= 48 && c <= 57) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102);
    if (!isHexChar) {
      return false;
    }
  }
  return true;
}

/**
 * Recursively decodes all protobuf value fields in an object.
 * Returns a new object with decoded values.
 */
export function decodeProtobufValues(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // Check if this string is a JSON-encoded protobuf value
    const decoded = tryParseProtobufString(data);
    if (decoded !== null) {
      return decoded;
    }

    // Check if this is a hex-encoded string that might contain JSON
    if (isHexString(data)) {
      console.log(`[decodeProtobufValues] Found hex string, length=${data.length}`);
      const extracted = extractJsonFromHex(data);
      if (extracted !== null && extracted !== data) {
        console.log(`[decodeProtobufValues] Extracted JSON from hex string`);
        return extracted;
      }
    }

    return data;
  }

  if (Array.isArray(data)) {
    console.log(`[decodeProtobufValues] Processing array with ${data.length} items`);
    return data.map((item) => decodeProtobufValues(item));
  }

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    console.log(`[decodeProtobufValues] Processing object with keys:`, Object.keys(obj));

    // Check if this object is a protobuf wrapped value (typeUrl + value)
    if (isProtobufWrappedValue(data)) {
      console.log(`[decodeProtobufValues] Found wrapped protobuf value`);
      return decodeWrappedValue(data);
    }

    // Check if this object is a direct protobuf Value type
    if (isProtobufDirectValue(data)) {
      console.log(`[decodeProtobufValues] Found direct protobuf value`);
      return decodeDirectValue(data);
    }

    // Special handling for attribute response format { start, end, value }
    if ("value" in obj && "start" in obj && "end" in obj) {
      console.log(`[decodeProtobufValues] Found attribute format { start, end, value }`);
      console.log(`[decodeProtobufValues] Value type: ${typeof obj.value}`);

      let valueToProcess = obj.value;

      // Case 1: value is a JSON string that needs parsing (e.g., '{"typeUrl":"...","value":"hex..."}')
      if (typeof obj.value === "string") {
        // Try to parse as JSON first
        try {
          const parsed = JSON.parse(obj.value);
          if (typeof parsed === "object" && parsed !== null) {
            console.log(`[decodeProtobufValues] Parsed value string as JSON:`, Object.keys(parsed));
            valueToProcess = parsed;
          }
        } catch {
          // Not JSON, check if it's a hex string
          if (isHexString(obj.value)) {
            console.log(`[decodeProtobufValues] Value is hex string, extracting...`);
            const extracted = extractJsonFromHex(obj.value);
            if (extracted !== null && typeof extracted === "object") {
              return { start: obj.start, end: obj.end, value: extracted, _decoded: true };
            }
          }
        }
      }

      // Case 2: value is a wrapped protobuf { typeUrl, value }
      if (typeof valueToProcess === "object" && valueToProcess !== null) {
        const valueObj = valueToProcess as Record<string, unknown>;
        if ("typeUrl" in valueObj && "value" in valueObj) {
          console.log(`[decodeProtobufValues] Value is wrapped protobuf with typeUrl:`, valueObj.typeUrl);
          const decoded = decodeWrappedValue(valueObj as ProtobufValue);
          console.log(`[decodeProtobufValues] Decoded wrapped value:`, decoded);
          if (decoded !== null && typeof decoded === "object") {
            return { start: obj.start, end: obj.end, value: decoded, _decoded: true };
          }
        }
      }
    }

    // Recursively process all properties
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = decodeProtobufValues(value);
    }
    return result;
  }

  return data;
}

/**
 * Checks if the data contains any protobuf-encoded values
 */
export function hasProtobufValues(data: unknown): boolean {
  if (data === null || data === undefined) {
    return false;
  }

  if (typeof data === "string") {
    return tryParseProtobufString(data) !== null;
  }

  if (Array.isArray(data)) {
    return data.some((item) => hasProtobufValues(item));
  }

  if (typeof data === "object") {
    if (isProtobufWrappedValue(data) || isProtobufDirectValue(data)) {
      return true;
    }
    return Object.values(data).some((value) => hasProtobufValues(value));
  }

  return false;
}
