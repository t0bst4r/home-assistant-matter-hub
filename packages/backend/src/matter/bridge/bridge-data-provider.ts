import type {
  BridgeBasicInformation,
  BridgeData,
  BridgeFeatureFlags,
} from "@home-assistant-matter-hub/common";
import type { Environment } from "@matter/main";

export class BridgeDataProvider {
  get basicInformation(): BridgeBasicInformation {
    return this.bridgeData.basicInformation;
  }

  get featureFlags(): BridgeFeatureFlags {
    return this.bridgeData.featureFlags ?? {};
  }

  constructor(
    environment: Environment,
    private readonly bridgeData: BridgeData,
  ) {
    environment.set(BridgeDataProvider, this);
  }
}
