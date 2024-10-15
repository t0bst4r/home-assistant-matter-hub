import { ApiResponse, useApi } from "./api.ts";
import { BridgeData, DeviceData } from "@home-assistant-matter-hub/common";
import { useCallback } from "react";

export function useDevices(
  bridge: BridgeData,
  seed?: number,
): ApiResponse<DeviceData[]> {
  const cb = useCallback(
    () =>
      fetch(`/api/matter/bridges/${bridge.id}/devices?_s=${seed}`).then(
        (res) => res.json() as Promise<DeviceData[]>,
      ),
    [bridge, seed],
  );
  return useApi(cb);
}
