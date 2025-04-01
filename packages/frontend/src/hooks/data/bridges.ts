import type {
  BridgeDataWithMetadata,
  CreateBridgeRequest,
  UpdateBridgeRequest,
} from "@home-assistant-matter-hub/common";
import { useCallback, useMemo } from "react";
import {
  createBridge,
  deleteBridge,
  resetBridge,
  updateBridge,
} from "../../state/bridges/bridge-actions.ts";
import {
  selectBridge,
  selectBridges,
  selectUsedPorts,
} from "../../state/bridges/bridge-selectors.ts";
import { useAppDispatch, useAppSelector } from "../../state/hooks.ts";
import type { AsyncError } from "../../state/utils/async.ts";

export function useBridges() {
  return useAppSelector(selectBridges);
}

export function useUsedPorts() {
  return useAppSelector(selectUsedPorts);
}

export function useBridge(bridgeId: string) {
  const selector = useMemo(() => selectBridge(bridgeId), [bridgeId]);
  return useAppSelector(selector);
}

export function useCreateBridge(): (
  req: CreateBridgeRequest,
) => Promise<BridgeDataWithMetadata> {
  const dispatch = useAppDispatch();
  return useCallback(
    async (req: CreateBridgeRequest) => {
      const res = await dispatch(createBridge(req));
      if (res.meta.requestStatus === "rejected") {
        throw (res as { error: AsyncError }).error;
      }
      return res.payload as BridgeDataWithMetadata;
    },
    [dispatch],
  );
}

export function useUpdateBridge(): (
  req: UpdateBridgeRequest,
) => Promise<BridgeDataWithMetadata> {
  const dispatch = useAppDispatch();
  return useCallback(
    async (req: UpdateBridgeRequest) => {
      const res = await dispatch(updateBridge(req));
      if (res.meta.requestStatus === "rejected") {
        throw (res as { error: AsyncError }).error;
      }
      return res.payload as BridgeDataWithMetadata;
    },
    [dispatch],
  );
}

export function useResetBridge(): (
  bridgeId: string,
) => Promise<BridgeDataWithMetadata> {
  const dispatch = useAppDispatch();
  return useCallback(
    async (bridgeId: string) => {
      const res = await dispatch(resetBridge(bridgeId));
      if (res.meta.requestStatus === "rejected") {
        throw (res as { error: AsyncError }).error;
      }
      return res.payload as BridgeDataWithMetadata;
    },
    [dispatch],
  );
}

export function useDeleteBridge(): (bridgeId: string) => Promise<void> {
  const dispatch = useAppDispatch();
  return useCallback(
    async (bridgeId: string) => {
      const res = await dispatch(deleteBridge(bridgeId));
      if (res.meta.requestStatus === "rejected") {
        throw (res as { error: AsyncError }).error;
      }
    },
    [dispatch],
  );
}
