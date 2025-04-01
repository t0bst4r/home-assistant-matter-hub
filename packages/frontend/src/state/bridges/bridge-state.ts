import type { BridgeDataWithMetadata } from "@home-assistant-matter-hub/common";
import type { AsyncState } from "../utils/async.ts";

export interface BridgeState {
  items: AsyncState<BridgeDataWithMetadata[]>;
}
