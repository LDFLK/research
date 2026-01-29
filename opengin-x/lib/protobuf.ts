/**
 * Decodes protobuf StringValue hex-encoded values found in API responses.
 *
 * Example input:
 * {"typeUrl":"type.googleapis.com/google.protobuf.StringValue","value":"4465706172746D656E74"}
 *
 * The "value" field is a hex-encoded UTF-8 string.
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

interface ProtobufStringValue {
  typeUrl: string;
  value: string;
}

function isProtobufStringValue(obj: unknown): obj is ProtobufStringValue {
  if (typeof obj !== "object" || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return (
    typeof record.typeUrl === "string" &&
    record.typeUrl.includes("google.protobuf.StringValue") &&
    typeof record.value === "string"
  );
}

function tryParseProtobufString(str: string): string | null {
  try {
    const parsed = JSON.parse(str);
    if (isProtobufStringValue(parsed)) {
      return hexToString(parsed.value);
    }
  } catch {
    // Not a JSON string, return null
  }
  return null;
}

/**
 * Recursively decodes all protobuf StringValue fields in an object.
 * Returns a new object with decoded values.
 */
export function decodeProtobufValues(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // Check if this string is a JSON-encoded protobuf StringValue
    const decoded = tryParseProtobufString(data);
    if (decoded !== null) {
      return decoded;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => decodeProtobufValues(item));
  }

  if (typeof data === "object") {
    // Check if this object itself is a protobuf StringValue
    if (isProtobufStringValue(data)) {
      return hexToString(data.value);
    }

    // Recursively process all properties
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
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
    if (isProtobufStringValue(data)) {
      return true;
    }
    return Object.values(data).some((value) => hasProtobufValues(value));
  }

  return false;
}
