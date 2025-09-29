import type { BridgeData } from "@home-assistant-matter-hub/common";
import type { Environment } from "@matter/main";
import { type Endpoint, ServerNode } from "@matter/main/node";
import { createBridgeServerConfig } from "../../utils/json/create-bridge-server-config.js";

export class BridgeServerNode extends ServerNode {
  constructor(env: Environment, bridgeData: BridgeData, aggregator: Endpoint) {
    const config = createBridgeServerConfig(bridgeData);
    super({
      ...config,
      environment: env,
      parts: [...(config.parts ?? []), aggregator],
    });
  }

  async factoryReset() {
    await this.cancel();
    await this.erase();
  }
}
