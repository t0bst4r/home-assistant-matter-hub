import type { Logger } from "@matter/general";
import { type Environment, Environmental } from "@matter/main";
import { callService } from "home-assistant-js-websocket";
import type { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";
import { LoggerService } from "../environment/logger.js";
import { HomeAssistantClient } from "./home-assistant-client.js";

export class HomeAssistantActions {
  private readonly log: Logger;

  static [Environmental.create](environment: Environment) {
    return new HomeAssistantActions(environment);
  }

  constructor(private readonly environment: Environment) {
    environment.set(HomeAssistantActions, this);
    this.log = environment.get(LoggerService).get("HomeAssistantActions");
  }

  async callAction<T = void>(
    domain: string,
    action: string,
    data: object | undefined,
    target: HassServiceTarget,
    returnResponse?: boolean,
  ): Promise<T> {
    this.log.debug(
      `Calling action '${domain}.${action}' for target ${JSON.stringify(target)} with data ${JSON.stringify(data ?? {})}`,
    );
    const client = await this.environment.load(HomeAssistantClient);
    const result = await callService(
      client.connection,
      domain,
      action,
      data,
      target,
      returnResponse,
    );
    return result as T;
  }
}
