import { HassServiceTarget } from "home-assistant-js-websocket/dist/types.js";

export interface HomeAssistantActions {
  callAction<T = void>(
    domain: string,
    action: string,
    data: object | undefined,
    target: HassServiceTarget,
    returnResponse?: boolean,
  ): Promise<T>;
}
