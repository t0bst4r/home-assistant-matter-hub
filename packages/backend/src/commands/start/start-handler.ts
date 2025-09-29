import * as ws from "ws";
import type { ArgumentsCamelCase } from "yargs";
import { WebApi } from "../../api/web-api.js";
import { configureDefaultEnvironment } from "../../core/app/configure-default-environment.js";
import { Options } from "../../core/app/options.js";
import { AppEnvironment } from "../../core/ioc/app-environment.js";
import { BridgeService } from "../../services/bridges/bridge-service.js";
import { HomeAssistantRegistry } from "../../services/home-assistant/home-assistant-registry.js";
import type { StartOptions } from "./start-options.js";

export async function startHandler(
  startOptions: ArgumentsCamelCase<StartOptions>,
  webUiDist?: string,
): Promise<void> {
  Object.assign(globalThis, {
    WebSocket: globalThis.WebSocket ?? ws.WebSocket,
  });
  const options = new Options({ ...startOptions, webUiDist });
  const rootEnv = configureDefaultEnvironment(options);
  const appEnvironment = await AppEnvironment.create(rootEnv, options);

  const bridgeService$ = appEnvironment.load(BridgeService);
  const webApi$ = appEnvironment.load(WebApi);
  const registry$ = appEnvironment.load(HomeAssistantRegistry);

  const initBridges = bridgeService$.then((b) => b.startAll());
  const initApi = webApi$.then((w) => w.start());

  const enableAutoRefresh = initBridges
    .then(() => Promise.all([registry$, bridgeService$]))
    .then(([r, b]) => r.enableAutoRefresh(() => b.refreshAll()));

  await Promise.all([initBridges, initApi, enableAutoRefresh]);
}
