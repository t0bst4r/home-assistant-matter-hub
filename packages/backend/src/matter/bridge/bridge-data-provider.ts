import type {
  BridgeBasicInformation,
  BridgeData,
  BridgeFeatureFlags,
} from "@home-assistant-matter-hub/common";
import type { Environment } from "@matter/main";

export class BridgeDataProvider {
  get basicInformation(): BridgeBasicInformation {
    return this.getBridgeData().basicInformation;
  }

  get featureFlags(): BridgeFeatureFlags {
    return this.getBridgeData().featureFlags ?? {};
  }

  constructor(
    environment: Environment,
    private readonly getBridgeData: () => BridgeData,
  ) {
    environment.set(BridgeDataProvider, this);
  }
}
