import "@project-chip/matter-node.js";
import { WebApi } from "../api/web-api.js";
import { BridgeService } from "../matter/bridge-service.js";
import { ArgumentsCamelCase, Argv, CommandModule } from "yargs";
import { createLogger } from "../logging/create-logger.js";
import { VendorId } from "@project-chip/matter.js/datatype";
import { HomeAssistantClient } from "../home-assistant/home-assistant-client.js";
import * as ws from "ws";
import { BridgeBasicInformation } from "@home-assistant-matter-hub/common";
import { Environment } from "@project-chip/matter.js/environment";
import { Service } from "../utils/service.js";
import { Logger } from "winston";
import { StorageService } from "../storage/index.js";
import { createChildLogger } from "../logging/create-child-logger.js";
import { Logger as MatterLogger } from "@project-chip/matter.js/log";
import { matterJsLogger } from "../logging/matter-js-logger.js";
import _ from "lodash";

interface Options {
  "log-level": string;
  "web-port": number;
  "disable-log-colors": boolean;
  "home-assistant-url": string;
  "home-assistant-access-token": string;
}

const basicInformation: BridgeBasicInformation = {
  vendorId: VendorId(0xfff1),
  vendorName: "t0bst4r",
  productId: 0x8000,
  productName: "MatterHub",
  productLabel: "Home Assistant Matter Hub",
  hardwareVersion: 2024,
  softwareVersion: 2024,
};

function builder(yargs: Argv): Argv<Options> {
  return yargs
    .version(false)
    .option("log-level", {
      type: "string",
      choices: ["debug", "info", "warn", "error"],
      default: "info",
    })
    .option("disable-log-colors", {
      type: "boolean",
      default: false,
    })
    .option("web-port", {
      type: "number",
      description: "Port used by the web application",
      default: 8080,
    })
    .option("home-assistant-url", {
      type: "string",
      description: "The HTTP-URL of your Home Assistant URL",
    })
    .option("home-assistant-access-token", {
      type: "string",
      description: "A long-lived access token for your Home Assistant Instance",
    })
    .demandOption(["home-assistant-url", "home-assistant-access-token"]);
}

async function handler(
  options: ArgumentsCamelCase<Options>,
  webUiDist?: string,
): Promise<void> {
  Object.assign(globalThis, {
    WebSocket: globalThis.WebSocket ?? ws.WebSocket,
  });

  const logger = createLogger(options.logLevel, options.disableLogColors);
  MatterLogger.level = "debug";
  MatterLogger.log = matterJsLogger(createChildLogger(logger, "matter.js"));

  const environment = Environment.default;
  const storage = new StorageService(logger, environment);

  const homeAssistant = new HomeAssistantClient({
    logger,
    url: options.homeAssistantUrl,
    accessToken: options.homeAssistantAccessToken,
  });

  const bridgeService = new BridgeService({
    logger,
    environment,
    storage,
    basicInformation,
    homeAssistant,
  });

  const webApi = new WebApi({
    logger,
    bridgeService,
    port: options.webPort,
    webUiDist,
  });

  const services: Service[] = [storage, homeAssistant, bridgeService, webApi];
  for (const service of services) {
    await service.start?.();
  }
  const close = closeFn(logger, _.reverse(services));
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

function closeFn(
  logger: Logger,
  services: Service[],
): (evt: string) => Promise<void> {
  const log = createChildLogger(logger, "Close");
  return async (evt: string) => {
    log.info("Received %s, shutting down", evt);
    for (const service of services) {
      log.debug("Shutting down %s", service.serviceName);
      await service.close?.()?.catch((reason) => {
        log.warn("Failed to close %s: %s", service, reason);
      });
      log.debug("%s shut down", service.serviceName);
    }
    process.exit(0);
  };
}

function startCommand(webDist?: string): CommandModule<{}, Options> {
  return {
    command: "start",
    describe: "start the application",
    builder,
    handler: (args) => handler(args, webDist),
  };
}

export default startCommand;
