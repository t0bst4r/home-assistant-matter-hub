import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { Environment, VendorId } from "@matter/main";
import { ArgumentsCamelCase } from "yargs";
import { StartOptions } from "./start-options.js";
import * as ws from "ws";
import { customLogger } from "../../logging/custom-logger.js";
import { createEnvironment } from "../../environment/environment.js";
import { HomeAssistantClient } from "../../home-assistant/home-assistant-client.js";
import { BridgeService } from "../../matter/bridge-service.js";
import { WebApi } from "../../api/web-api.js";
import AsyncLock from "async-lock";

const basicInformation: BridgeBasicInformation = {
  vendorId: VendorId(0xfff1),
  vendorName: "t0bst4r",
  productId: 0x8000,
  productName: "MatterHub",
  productLabel: "Home Assistant Matter Hub",
  hardwareVersion: 2024,
  softwareVersion: 2024,
};

export async function startHandler(
  options: ArgumentsCamelCase<StartOptions>,
  webUiDist?: string,
): Promise<void> {
  Object.assign(globalThis, {
    WebSocket: globalThis.WebSocket ?? ws.WebSocket,
  });
  customLogger.configure(options.logLevel, !options.disableLogColors);

  const environment = createEnvironment(Environment.default, {
    mdnsNetworkInterface: options.mdnsNetworkInterface,
    storageLocation: options.storageLocation,
  });
  environment.set(AsyncLock, new AsyncLock());

  new HomeAssistantClient(environment, {
    url: options.homeAssistantUrl,
    accessToken: options.homeAssistantAccessToken,
  });

  new BridgeService(environment, basicInformation);

  new WebApi(environment, {
    port: options.webPort,
    webUiDist,
  });

  // Ensure bridges are loaded and api is ready
  await environment.load(BridgeService);
  await environment.load(WebApi);

  const close = closeFn(environment);
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

function closeFn(environment: Environment) {
  return async () => {
    environment.runtime.interrupt();
  };
}
