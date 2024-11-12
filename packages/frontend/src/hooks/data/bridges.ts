import { useCallback, useEffect } from "react";
import {
  BridgeData,
  CreateBridgeRequest,
  UpdateBridgeRequest,
} from "@home-assistant-matter-hub/common";
import { AsyncError } from "../../state/utils/async.ts";
import {
  selectBridge,
  selectBridges,
  selectUsedPorts,
} from "../../state/bridges/bridge-selectors.ts";
import {
  createBridge,
  deleteBridge,
  requireBridges,
  resetBridge,
  updateBridge,
} from "../../state/bridges/bridge-actions.ts";
import { useAppDispatch, useAppSelector } from "../../state/hooks.ts";

export function useBridges() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(requireBridges());
  }, [dispatch]);
  return useAppSelector(selectBridges);
}

export function useUsedPorts() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(requireBridges());
  }, [dispatch]);
  return useAppSelector(selectUsedPorts);
}

export function useBridge(bridgeId: string | undefined) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(requireBridges());
  }, [dispatch]);
  return useAppSelector(selectBridge(bridgeId));
}

export function useCreateBridge(): (
  req: CreateBridgeRequest,
) => Promise<BridgeData> {
  const dispatch = useAppDispatch();
  return useCallback(
    async (req: CreateBridgeRequest) => {
      const res = await dispatch(createBridge(req));
      if (res.meta.requestStatus === "rejected") {
        throw (res as { error: AsyncError }).error;
      } else {
        return res.payload as BridgeData;
      }
    },
    [dispatch],
  );
}

export function useUpdateBridge(): (
  req: UpdateBridgeRequest,
) => Promise<BridgeData> {
  const dispatch = useAppDispatch();
  return useCallback(
    async (req: UpdateBridgeRequest) => {
      const res = await dispatch(updateBridge(req));
      if (res.meta.requestStatus === "rejected") {
        throw (res as { error: AsyncError }).error;
      } else {
        return res.payload as BridgeData;
      }
    },
    [dispatch],
  );
}

export function useResetBridge(): (bridgeId: string) => Promise<BridgeData> {
  const dispatch = useAppDispatch();
  return useCallback(
    async (bridgeId: string) => {
      const res = await dispatch(resetBridge(bridgeId));
      if (res.meta.requestStatus === "rejected") {
        throw (res as { error: AsyncError }).error;
      } else {
        return res.payload as BridgeData;
      }
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
