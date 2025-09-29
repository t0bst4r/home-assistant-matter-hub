import type {
  HomeAssistantDeviceRegistry,
  HomeAssistantEntityRegistry,
} from "@home-assistant-matter-hub/common";
import type { Connection } from "home-assistant-js-websocket";

export async function getRegistry(
  connection: Connection,
): Promise<HomeAssistantEntityRegistry[]> {
  return await connection.sendMessagePromise<HomeAssistantEntityRegistry[]>({
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
