import type { BridgeDataWithMetadata } from "@home-assistant-matter-hub/common";
import { type AppState, createAppSelector } from "../types";
import type { AsyncState } from "../utils/async";

export const selectBridgeState = (state: AppState) => state.bridges;

export const selectBridges = createAppSelector(
  [selectBridgeState],
  (bridgeState) => bridgeState.items,
);

export const selectBridge = (bridgeId: string | undefined) =>
  createAppSelector([selectBridges], (bridges) => {
    const result: AsyncState<BridgeDataWithMetadata> = {
      isInitialized: bridges.isInitialized,
      isLoading: bridges.isLoading,
      error: bridges.error,
      content: bridges.content?.find((b) => b.id === bridgeId),
    };
    return result;
  });

export const selectUsedPorts = createAppSelector([selectBridges], (bridges) => {
  if (!bridges.isInitialized) {
    return undefined;
  }
  const result: Record<number, string> = {};
  const pairs =
    bridges.content?.map((b) => [b.port, b.id] as [number, string]) ?? [];
  pairs.forEach(([key, value]) => {
    result[key] = value;
  });
  return result;
});
