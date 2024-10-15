import { useCallback } from "react";
import {
  BridgeData,
  CreateBridgeRequest,
} from "@home-assistant-matter-hub/common";
import { ApiResponse, useApi } from "./api";

export function useBridges(seed?: number): ApiResponse<BridgeData[]> {
  const cb = useCallback(
    () =>
      fetch(`/api/matter/bridges?_s=${seed}`).then(
        (res) => res.json() as Promise<BridgeData[]>,
      ),
    [seed],
  );
  return useApi(cb);
}

export function useCreateBridge(): (
  req: CreateBridgeRequest,
) => Promise<[BridgeData, undefined] | [undefined, Error]> {
  return useCallback(
    (req: CreateBridgeRequest) =>
      fetch("/api/matter/bridges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      })
        .then((res) => res.json() as Promise<BridgeData>)
        .then((bridge) => [bridge, undefined] as [BridgeData, undefined])
        .catch((error) => [undefined, error] as [undefined, Error]),
    [],
  );
}
