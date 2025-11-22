/**
 * Resolve a dot-separated JSON path like "today.isBinDay".
 */
export function getApiJsonResponseAsBoolean(obj: unknown, path: string): boolean {
  try {
    let value: unknown = false;
    value = path
      .split('.')
      .reduce((acc: unknown, key: string) => {
        if (acc !== null && typeof acc === 'object' && key in acc) {
          return (acc as Record<string, unknown>)[key];
        }
        return undefined;
      }, obj);

    return Boolean(value);
  } catch {
    return false;
  }
}