/**
 * Normalizes email so that equivalent emails can be compared.
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Converts `{ a: { b: "c" }, d: "e", f: { } }`
 * Into:
 * ```
 * [
 *   ["a.b": "c"],
 *   ["d": "3"]
 * ]
 * ```
 */
export function flattenObject(
  obj: object | undefined
): Array<[string, string]> {
  if (obj === undefined || obj === null) {
    return [];
  }

  let res: Array<[string, string]> = [];
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string" || typeof v === "number") {
      res.push([k, v + ""]);
    } else {
      const flattenedChild: Array<[string, string]> = flattenObject(v).map(
        ([ck, cv]) => [k + "." + ck, cv]
      );
      res = [...res, ...flattenedChild];
    }
  }

  return res;
}

export function str(val: unknown): string {
  return JSON.stringify(val);
}
