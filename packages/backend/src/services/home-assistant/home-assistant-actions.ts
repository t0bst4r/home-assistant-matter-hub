import type { Logger } from "@matter/general";
import { callService } from "home-assistant-js-websocket";
import type { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";
import type { LoggerService } from "../../core/app/logger.js";
import { Service } from "../../core/ioc/service.js";
import { DebounceContext } from "../../utils/debounce-context.js";
import type { HomeAssistantClient } from "./home-assistant-client.js";

export interface HomeAssistantAction {
  action: string;
  data?: object | undefined;
}

interface HomeAssistantActionCall extends HomeAssistantAction {
  entityId: string;
}

export class HomeAssistantActions extends Service {
  private readonly log: Logger;
  private readonly debounceContext = new DebounceContext(
    this.processAction.bind(this),
  );

  constructor(
    logger: LoggerService,
    private readonly client: HomeAssistantClient,
  ) {
    super("HomeAssistantActions");
    this.log = logger.get(this);
  }

  private processAction(_key: string, calls: HomeAssistantActionCall[]) {
    const entity_id = calls[0].entityId;
    const action = calls[0].action;
    const data = Object.assign({}, ...calls.map((c) => c.data));
    const [domain, actionName] = action.split(".");
    void this.callAction(domain, actionName, data, { entity_id }, false);
  }

  call(action: HomeAssistantAction, entityId: string) {
    const key = `${entityId}-${action.action}`;
    this.debounceContext.get(key, 100)({ ...action, entityId });
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

  override async dispose(): Promise<void> {
    this.debounceContext.unregisterAll();
  }
}
