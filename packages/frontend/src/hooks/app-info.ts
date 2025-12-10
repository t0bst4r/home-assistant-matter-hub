import { useMemo } from "react";
import packageJson from "../../../../apps/home-assistant-matter-hub/package.json";

export interface AppInfo {
  name: string;
  version: string;
}

export function useAppInfo(): AppInfo {
  return useMemo(
    () => ({ name: packageJson.name, version: __APP_VERSION__ }),
    [],
  );
}
