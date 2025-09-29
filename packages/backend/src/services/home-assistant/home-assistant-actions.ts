import type { Logger } from "@matter/general";
import { callService } from "home-assistant-js-websocket";
import type { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";
import type { LoggerService } from "../../core/app/logger.js";
import { Service } from "../../core/ioc/service.js";
import type { HomeAssistantClient } from "./home-assistant-client.js";

export interface HomeAssistantAction {
  action: string;
  data?: object | undefined;
}

export class HomeAssistantActions extends Service {
  private readonly log: Logger;

  constructor(
    logger: LoggerService,
    private readonly client: HomeAssistantClient,
  ) {
    super("HomeAssistantActions");
    this.log = logger.get(this);
  }

  call<T = void>(
    action: HomeAssistantAction,
    target: HassServiceTarget,
    returnResponse?: boolean,
  ): Promise<T> {
    const [domain, actionName] = action.action.split(".");
    return this.callAction(
      domain,
      actionName,
      action.data,
      target,
      returnResponse,
    );
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
    const result = await callService(
      this.client.connection,
      domain,
      action,
      data,
      target,
      returnResponse,
    );
    return result as T;
  }
}
