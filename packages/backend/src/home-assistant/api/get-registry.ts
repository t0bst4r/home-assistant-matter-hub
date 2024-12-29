import {
  HomeAssistantEntityRegistry,
  HomeAssistantDeviceRegistry,
} from "@home-assistant-matter-hub/common";
import { Connection } from "home-assistant-js-websocket";

export async function getRegistry(
  connection: Connection,
): Promise<HomeAssistantEntityRegistry[]> {
  return connection.sendMessagePromise<HomeAssistantEntityRegistry[]>({
    type: "config/entity_registry/list",
  });
}

export async function getDeviceRegistry(
  connection: Connection,
): Promise<HomeAssistantDeviceRegistry[]> {
  return connection.sendMessagePromise<HomeAssistantDeviceRegistry[]>({
    type: "config/device_registry/list",
  });
}
