import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { Environment, VendorId } from "@matter/main";
import { ArgumentsCamelCase } from "yargs";
import { StartOptions } from "./start-options.js";
import * as ws from "ws";
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

  const environment = createEnvironment(Environment.default, {
    mdnsNetworkInterface: options.mdnsNetworkInterface,
    storageLocation: options.storageLocation,
    logLevel: options.logLevel,
    disableLogColors: options.disableLogColors,
  });
  environment.set(AsyncLock, new AsyncLock());

  await new HomeAssistantClient(environment, {
    url: options.homeAssistantUrl,
    accessToken: options.homeAssistantAccessToken,
  }).construction;

  await new BridgeService(environment, basicInformation).construction;

  await new WebApi(environment, {
    port: options.httpPort,
    whitelist: options.httpIpWhitelist?.map((item) => item.toString()),
    webUiDist,
    ...(options.httpAuthUsername && options.httpAuthPassword
      ? {
          auth: {
            username: options.httpAuthUsername,
            password: options.httpAuthPassword,
          },
        }
      : {}),
  }).construction;
}
