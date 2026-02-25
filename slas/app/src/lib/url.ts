/** Encode a file number for use in URL path segments. Replaces / with ~ */
export function encodeFileNumber(fileNumber: string): string {
  return fileNumber.replace(/\//g, "~");
}

/** Decode a file number from a URL path segment. Handles both ~ and %2F encoding */
export function decodeFileNumber(param: string): string {
  return decodeURIComponent(param).replace(/~/g, "/");
}
