import { DatabaseSync } from "node:sqlite";

type SQLOutputValue =
  | null
  | number
  | bigint
  | string
  | Uint8Array;

export function row<T>(result: Record<string, SQLOutputValue> | undefined): T | null {
  if (!result) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(result)) {
    out[k] = v;
  }
  return out as T;
}

export function rows<T>(results: Record<string, SQLOutputValue>[]): T[] {
  return results.map((r) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(r)) {
      out[k] = v;
    }
    return out as T;
  });
}
