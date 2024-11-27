import { BridgeDataWithMetadata } from "@home-assistant-matter-hub/common";
import { AsyncState } from "../utils/async.ts";

export interface BridgeState {
  items: AsyncState<BridgeDataWithMetadata[]>;
}
