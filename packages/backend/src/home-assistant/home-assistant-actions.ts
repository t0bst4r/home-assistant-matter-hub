import { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";
import { Environment, Environmental } from "@matter/main";
import { callService } from "home-assistant-js-websocket";
import { createLogger } from "../logging/create-logger.js";
import { HomeAssistantClient } from "./home-assistant-client.js";

export class HomeAssistantActions {
  private readonly log = createLogger("HomeAssistantActions");

  static [Environmental.create](environment: Environment) {
    return new this(environment);
  }

  constructor(private readonly environment: Environment) {
    environment.set(HomeAssistantActions, this);
  }

  async callAction<T = void>(
    domain: string,
    action: string,
    data: object | undefined,
    target: HassServiceTarget,
    returnResponse?: boolean,
  ): Promise<T> {
    this.log.debug(
      "Calling action '%s.%s' for target %s with data %s",
      domain,
      action,
      JSON.stringify(target),
      JSON.stringify(data ?? {}),
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
