import { type SupportedStorageTypes, toJson } from "@matter/general";

export function MatterJsonObject<T extends object>(obj: T): T {
  return new Proxy<T>(obj, {
    get(target, prop, receiver) {
      if (prop === "toJSON") {
        return toJson(obj as SupportedStorageTypes);
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}
