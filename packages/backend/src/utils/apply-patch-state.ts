import _ from "lodash";

export function applyPatchState<T extends {}>(
  state: T,
  patch: Partial<T>,
): Partial<T> {
  const actualPatch: Partial<T> = {};
  const keys = Object.keys(patch) as Array<keyof T>;
  for (const key of keys) {
    const patchValue = patch[key];
    if (patchValue !== undefined && !deepEqual(state[key], patchValue)) {
      actualPatch[key] = patchValue!;
    }
  }
  if (_.size(actualPatch) > 0) {
    try {
      Object.assign(state, actualPatch);
    } catch (e) {
      throw new Error(
        `Failed to patch the following properties: ${JSON.stringify(actualPatch, null, 2)}`,
        { cause: e },
      );
    }
  }
  return actualPatch;
}

function deepEqual<T>(a: T, b: T): boolean {
  if (a == null || b == null) {
    return a === b;
  } else if (typeof a !== typeof b || Array.isArray(a) != Array.isArray(b)) {
    return false;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((vA, idx) => deepEqual(vA, b[idx]));
  } else if (typeof a === "object" && typeof b === "object") {
    const keys = Object.keys({ ...a, ...b }) as (keyof T)[];
    return keys.every((key) => deepEqual(a[key], b[key]));
  } else {
    return a === b;
  }
}
