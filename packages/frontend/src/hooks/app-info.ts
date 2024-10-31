import packageJson from "../../../../apps/home-assistant-matter-hub/package.json";
import { useMemo } from "react";

export interface AppInfo {
  name: string;
  version: string;
}

export function useAppInfo(): AppInfo {
  return useMemo(
    () => ({ name: packageJson.name, version: packageJson.version }),
    [],
  );
}
